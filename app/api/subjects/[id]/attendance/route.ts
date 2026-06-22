import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Zod schema for validation
const attendanceSchema = z.object({
  date: z.string(), // ISO string date
  attended: z.boolean(),
  classType: z.string().optional().default('lecture')
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify subject belongs to user
    const subject = await prisma.subject.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        subjectId: id
      },
      orderBy: {
        classDate: 'asc'
      }
    });

    return NextResponse.json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify subject belongs to user
    const subject = await prisma.subject.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = attendanceSchema.parse(body);

    // Ensure we store it as a proper Date (midnight UTC for consistent class tracking)
    // For local dates, we just parse the ISO string.
    const classDate = new Date(validatedData.date);
    classDate.setUTCHours(0, 0, 0, 0);

    // Upsert attendance for this subject, date, and classType
    const attendance = await prisma.attendance.upsert({
      where: {
        subjectId_classDate_classType: {
          subjectId: id,
          classDate: classDate,
          classType: validatedData.classType
        }
      },
      update: {
        attended: validatedData.attended
      },
      create: {
        subjectId: id,
        classDate: classDate,
        attended: validatedData.attended,
        classType: validatedData.classType
      }
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error recording attendance:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 });
  }
}
