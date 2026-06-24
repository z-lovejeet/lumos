import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { ParsedSubject } from '@/lib/ai/transcript-parser';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { semester, subjects } = await req.json();

    if (!semester || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json({ error: 'Invalid payload. Semester number and subjects array are required.' }, { status: 400 });
    }

    // Upsert the Semester
    const sem = await prisma.semester.upsert({
      where: {
        userId_number: {
          userId: user.id,
          number: semester
        }
      },
      update: {
        status: 'completed'
      },
      create: {
        userId: user.id,
        number: semester,
        name: `Semester ${semester}`,
        status: 'completed',
        totalCredits: subjects.reduce((sum, s) => sum + (s.credits || 0), 0)
      }
    });

    // Create the subjects inside a transaction
    await prisma.$transaction(
      subjects.map((sub: ParsedSubject) => {
        return prisma.subject.create({
          data: {
            userId: user.id,
            semesterId: sem.id,
            name: sub.name,
            code: sub.name.substring(0, 5).toUpperCase().replace(/\s/g, '') + '101', // Dummy code
            credits: sub.credits || 3,
            category: 'core',
            difficulty: 'medium',
            // If grade was extracted, we could optionally map it to a 'Final' Mark.
            marks: {
              create: {
                componentName: 'Final Grade: ' + (sub.grade || 'P'),
                maxMarks: 100,
                obtainedMarks: null,
              }
            }
          }
        });
      })
    );

    return NextResponse.json({ success: true, count: subjects.length });
  } catch (error: any) {
    console.error('Bulk Import API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to bulk insert subjects' }, { status: 500 });
  }
}
