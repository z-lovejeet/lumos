import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase/server';
import prisma from '../../../lib/prisma';
import { generateStrategy, StrategyEngineData } from '../../../lib/strategy/strategy-engine';
import { detectRisks, RiskDetectorData } from '../../../lib/alerts/risk-detector';
import { calculateStudyPriorities, StudyPriorityData } from '../../../lib/strategy/study-priority';
import { calculateAttendancePercent } from '../../../lib/calculations/attendance';
import { GradeRange } from '../../../lib/calculations/sgpa';

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active semester
    const activeSemester = await prisma.semester.findFirst({
      where: { userId: user.id, status: 'active' },
      include: {
        subjects: {
          include: {
            marks: true,
            attendance: true,
            markingScheme: true
          }
        }
      }
    });

    // We also need the user's active grade scale
    const gradeScaleRecord = await prisma.gradeScale.findFirst({
      where: { userId: user.id, isActive: true }
    });

    // Fallback grade scale if none exists
    const gradeScale: GradeRange[] = gradeScaleRecord 
      ? (gradeScaleRecord.grades as unknown as GradeRange[])
      : [
          { grade: 'O', minPercentage: 90, maxPercentage: 100, gpaValue: 10 },
          { grade: 'A+', minPercentage: 80, maxPercentage: 89.99, gpaValue: 9 },
          { grade: 'A', minPercentage: 70, maxPercentage: 79.99, gpaValue: 8 },
          { grade: 'B+', minPercentage: 60, maxPercentage: 69.99, gpaValue: 7 },
          { grade: 'B', minPercentage: 50, maxPercentage: 59.99, gpaValue: 6 },
          { grade: 'C', minPercentage: 40, maxPercentage: 49.99, gpaValue: 5 },
          { grade: 'F', minPercentage: 0, maxPercentage: 39.99, gpaValue: 0 },
        ];

    if (!activeSemester) {
      return NextResponse.json({
        recommendations: [],
        risks: [],
        priorities: []
      });
    }

    // Format data for AI engines
    const subjectsData = activeSemester.subjects.map(s => {
      const components = s.markingScheme 
        ? (s.markingScheme.components as any[]) 
        : [{ name: 'Final', maxMarks: 100, weight: 100, isOptional: false }];
      
      const totalClasses = s.attendance.length;
      const attendedClasses = s.attendance.filter(a => a.attended).length;
      const attendancePercent = calculateAttendancePercent(attendedClasses, totalClasses);

      // Dummy upcoming exam count logic (could query mark/calendar later)
      const upcomingExamsCount = 0;

      return {
        id: s.id,
        name: s.name,
        credits: s.credits,
        marks: s.marks,
        components,
        attendancePercent,
        upcomingExamsCount
      };
    });

    // Generate outputs
    const strategyData: StrategyEngineData = { subjects: subjectsData, gradeScale };
    const recommendations = generateStrategy(strategyData);

    const prioritiesData: StudyPriorityData = { subjects: subjectsData, gradeScale };
    const priorities = calculateStudyPriorities(prioritiesData);

    // Get SGPA trend (all past semesters)
    const allSemesters = await prisma.semester.findMany({
      where: { userId: user.id },
      include: { subjects: { include: { marks: true, markingScheme: true } } },
      orderBy: { number: 'desc' }
    });
    
    // In a real app we'd calculate exact SGPA for each past semester.
    // For now we just pass a dummy trend or empty array if we only have one semester
    // To do it properly, we could use the sgpa.ts functions, but that might be heavy
    const sgpaTrend: number[] = [];

    const riskData: RiskDetectorData = {
      subjects: subjectsData,
      gradeScale,
      sgpaTrend
    };
    const risks = detectRisks(riskData);

    return NextResponse.json({
      recommendations,
      priorities,
      risks
    });
  } catch (error) {
    console.error('Error fetching strategy:', error);
    return NextResponse.json({ error: 'Failed to generate strategy' }, { status: 500 });
  }
}
