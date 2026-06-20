import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const subject = await prisma.subject.findUnique({
      where: { id }
    })

    if (!subject || subject.userId !== user.id) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    const marks = await prisma.mark.findMany({
      where: { subjectId: id }
    })

    return NextResponse.json({ marks })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch marks' }, { status: 500 })
  }
}

const marksSchema = z.array(z.object({
  componentName: z.string(),
  maxMarks: z.number(),
  obtainedMarks: z.number().nullable(),
  examDate: z.string().optional().nullable()
}))

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const subject = await prisma.subject.findUnique({
      where: { id }
    })

    if (!subject || subject.userId !== user.id) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    const body = await req.json()
    const marksData = marksSchema.parse(body.marks)

    await prisma.$transaction(async (tx) => {
      for (const mark of marksData) {
        await tx.mark.upsert({
          where: {
            subjectId_componentName: {
              subjectId: id,
              componentName: mark.componentName
            }
          },
          update: {
            maxMarks: mark.maxMarks,
            obtainedMarks: mark.obtainedMarks,
            examDate: mark.examDate ? new Date(mark.examDate) : null,
          },
          create: {
            subjectId: id,
            componentName: mark.componentName,
            maxMarks: mark.maxMarks,
            obtainedMarks: mark.obtainedMarks,
            examDate: mark.examDate ? new Date(mark.examDate) : null,
          }
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update marks' }, { status: 400 })
  }
}
