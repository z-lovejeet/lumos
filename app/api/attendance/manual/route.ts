import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subjectId, totalClassesConducted, totalClassesAttended, totalClassesInSemester } = await req.json();

    if (!subjectId || totalClassesConducted === undefined || totalClassesAttended === undefined || totalClassesInSemester === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify subject belongs to user
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        userId: user.id
      }
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Update subject with new aggregate attendance fields
    const updatedSubject = await prisma.subject.update({
      where: { id: subjectId },
      data: {
        totalClassesConducted: parseInt(totalClassesConducted),
        totalClassesAttended: parseInt(totalClassesAttended),
        totalClassesInSemester: parseInt(totalClassesInSemester)
      }
    });

    return NextResponse.json({ success: true, data: updatedSubject });
  } catch (error: any) {
    console.error('Error updating manual attendance:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
