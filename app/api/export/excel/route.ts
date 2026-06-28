import { NextResponse } from 'next/server';
import { generateExcelReport } from '@/lib/export/excel-generator';
import { ExportSemester } from '@/lib/export/pdf-generator';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
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

    const { selectedSemesters } = await req.json().catch(() => ({ selectedSemesters: 'all' }));

    let semestersToExport = dbUser.semesters;
    if (Array.isArray(selectedSemesters)) {
      semestersToExport = dbUser.semesters.filter(sem => selectedSemesters.includes(sem.id));
    }

    let totalCreditsEarned = 0;
    let totalGradePoints = 0;

    const exportSemesters: ExportSemester[] = semestersToExport.map(sem => {
      let semCredits = 0;
      let semPoints = 0;

      const subjects = sem.subjects.map(sub => {
        let obtained = 0;
        let max = 0;
        sub.marks.forEach(m => {
          obtained += m.obtainedMarks || 0;
          max += m.maxMarks;
        });

        const percent = max > 0 ? (obtained / max) * 100 : 0;
        let grade = 'F';
        let point = 0;
        if (percent >= 90) { grade = 'O'; point = 10; }
        else if (percent >= 80) { grade = 'A+'; point = 9; }
        else if (percent >= 70) { grade = 'A'; point = 8; }
        else if (percent >= 60) { grade = 'B+'; point = 7; }
        else if (percent >= 50) { grade = 'B'; point = 6; }
        else if (percent >= 40) { grade = 'C'; point = 5; }

        semCredits += sub.credits;
        semPoints += (point * sub.credits);

        return {
          code: sub.code,
          name: sub.name,
          credits: sub.credits,
          grade
        };
      });

      const sgpa = semCredits > 0 ? (semPoints / semCredits) : 0;
      totalCreditsEarned += semCredits;
      totalGradePoints += semPoints;

      return {
        name: sem.name,
        number: sem.number,
        sgpa,
        totalCredits: semCredits,
        subjects
      };
    });

    const cgpa = totalCreditsEarned > 0 ? (totalGradePoints / totalCreditsEarned) : 0;

    const excelBuffer = generateExcelReport(dbUser.name || '', cgpa, exportSemesters);

    return new NextResponse(excelBuffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="lumos-report.xlsx"'
      }
    });

  } catch (error: any) {
    console.error('Excel Export Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
