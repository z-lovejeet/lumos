import { NextResponse } from 'next/server';
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

    // Generate CSV string
    const rows = [
      ['Semester', 'Course Code', 'Course Name', 'Credits', 'Grade']
    ];

    semestersToExport.forEach(sem => {
      sem.subjects.forEach(sub => {
        let obtained = 0;
        let max = 0;
        sub.marks.forEach(m => {
          obtained += m.obtainedMarks || 0;
          max += m.maxMarks;
        });

        const percent = max > 0 ? (obtained / max) * 100 : 0;
        let grade = 'F';
        if (percent >= 90) { grade = 'O'; }
        else if (percent >= 80) { grade = 'A+'; }
        else if (percent >= 70) { grade = 'A'; }
        else if (percent >= 60) { grade = 'B+'; }
        else if (percent >= 50) { grade = 'B'; }
        else if (percent >= 40) { grade = 'C'; }

        // Sanitize commas in names for CSV
        const safeName = `"${sub.name.replace(/"/g, '""')}"`;

        rows.push([
          sem.name,
          sub.code,
          safeName,
          sub.credits.toString(),
          grade
        ]);
      });
    });

    const csvString = rows.map(r => r.join(',')).join('\n');

    return new NextResponse(csvString, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="lumos-report.csv"'
      }
    });

  } catch (error: any) {
    console.error('CSV Export Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
