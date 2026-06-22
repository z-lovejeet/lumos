import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const noteSchema = z.object({
  subjectId: z.string().optional().nullable(),
  title: z.string().min(1, "Title is required"),
  content: z.string().default(""),
  type: z.string().default("note"),
  tags: z.array(z.string()).default([])
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    const notes = await prisma.note.findMany({
      where: {
        userId: user.id,
        ...(subjectId ? { subjectId } : {})
      },
      include: {
        subject: {
          select: { name: true, code: true }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = noteSchema.parse(body);

    if (validatedData.subjectId) {
      // Verify subject belongs to user
      const subject = await prisma.subject.findFirst({
        where: { id: validatedData.subjectId, userId: user.id }
      });
      if (!subject) {
        return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
      }
    }

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        subjectId: validatedData.subjectId || null,
        title: validatedData.title,
        content: validatedData.content,
        type: validatedData.type,
        tags: validatedData.tags
      }
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
