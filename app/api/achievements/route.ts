import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { checkAchievements, AchievementState, ACHIEVEMENT_DEFINITIONS } from '@/lib/achievements/achievement-engine';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: {
        achievements: true,
        semesters: {
          include: {
            subjects: {
              include: { attendance: true, marks: true }
            }
          }
        },
        careerPlans: true
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existingKeys = dbUser.achievements.map(a => a.achievementKey);

    // Build state for achievement engine
    const hasSubjects = dbUser.semesters.some(s => s.subjects.length > 0);
    const hasCareerPlan = dbUser.careerPlans.length > 0;
    
    let hasSgpaAbove8 = false;
    let hasPerfectSgpa = false;
    let hasPerfectAttendance = false;
    let has7DayStreak = false;

    const allAttendanceDates = new Set<string>();

    dbUser.semesters.forEach(sem => {
      let semCredits = 0;
      let semPoints = 0;
      
      sem.subjects.forEach(sub => {
        // Attendance check
        if (sub.attendance.length > 0) {
          const attended = sub.attendance.filter(a => a.attended).length;
          if (attended === sub.attendance.length) {
            hasPerfectAttendance = true;
          }
          sub.attendance.forEach(a => {
            // Store ISO date string (YYYY-MM-DD)
            allAttendanceDates.add(new Date(a.date).toISOString().split('T')[0]);
          });
        }

        // SGPA check
        let obtained = 0;
        let max = 0;
        sub.marks.forEach(m => {
          obtained += m.obtainedMarks || 0;
          max += m.maxMarks;
        });
        const percent = max > 0 ? (obtained / max) * 100 : 0;
        let point = 0;
        if (percent >= 90) point = 10;
        else if (percent >= 80) point = 9;
        else if (percent >= 70) point = 8;
        else if (percent >= 60) point = 7;
        else if (percent >= 50) point = 6;
        else if (percent >= 40) point = 5;
        
        semCredits += sub.credits;
        semPoints += point * sub.credits;
      });

      const sgpa = semCredits > 0 ? semPoints / semCredits : 0;
      if (sgpa >= 8.0) hasSgpaAbove8 = true;
      if (sgpa === 10.0) hasPerfectSgpa = true;
    });

    // Calculate 7-day streak
    const sortedDates = Array.from(allAttendanceDates).sort();
    let maxStreak = 0;
    let currentStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of sortedDates) {
      const d = new Date(dStr);
      if (!prevDate) {
        currentStreak = 1;
      } else {
        const diffTime = Math.abs(d.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }
      if (currentStreak > maxStreak) maxStreak = currentStreak;
      prevDate = d;
    }

    if (maxStreak >= 7) has7DayStreak = true;

    const state: AchievementState = {
      hasSubjects,
      hasSgpaAbove8,
      hasPerfectAttendance,
      hasCareerPlan,
      hasPerfectSgpa,
      has7DayStreak
    };

    const newKeys = checkAchievements(state, existingKeys);

    // Save new achievements
    if (newKeys.length > 0) {
      const creations = newKeys.map(key => {
        const def = ACHIEVEMENT_DEFINITIONS.find(d => d.key === key)!;
        return {
          userId: dbUser.id,
          achievementKey: key,
          title: def.title,
          description: def.description
        };
      });

      await prisma.achievement.createMany({
        data: creations,
        skipDuplicates: true
      });
    }

    // Fetch all fresh
    const updatedAchievements = await prisma.achievement.findMany({
      where: { userId: dbUser.id },
      orderBy: { earnedAt: 'desc' }
    });

    return NextResponse.json({
      earned: updatedAchievements,
      newUnlocked: newKeys,
      definitions: ACHIEVEMENT_DEFINITIONS
    });

  } catch (error: any) {
    console.error('Achievements API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
