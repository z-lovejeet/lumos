import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { predictPerformanceTrend } from '@/lib/predictions/trend-predictor';

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
        semesters: {
          include: {
            subjects: {
              include: { marks: true }
            }
          },
          orderBy: { number: 'asc' }
        }
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const historicalSgpas: number[] = [];

    dbUser.semesters.forEach(sem => {
      let semCredits = 0;
      let semPoints = 0;
      
      sem.subjects.forEach(sub => {
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

      if (semCredits > 0) {
        historicalSgpas.push(semPoints / semCredits);
      }
    });

    const prediction = predictPerformanceTrend(historicalSgpas);

    return NextResponse.json({
      historical: historicalSgpas,
      prediction
    });

  } catch (error: any) {
    console.error('Trend Prediction API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
