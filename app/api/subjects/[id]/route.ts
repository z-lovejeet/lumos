import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { subjectSchema } from '@/lib/validators'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const subject = await prisma.subject.findUnique({
      where: { id: params.id },
      include: { marks: true, attendance: true }
    })

    if (!subject || subject.userId !== user.id) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    return NextResponse.json({ subject })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subject' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validatedData = subjectSchema.parse(body)

    const existing = await prisma.subject.findUnique({ where: { id: params.id } })
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    const updated = await prisma.subject.update({
      where: { id: params.id },
      data: {
        semesterId: validatedData.semesterId,
        code: validatedData.code,
        name: validatedData.name,
        credits: validatedData.credits,
        category: validatedData.category,
        facultyName: validatedData.facultyName,
        colorCode: validatedData.colorCode,
        markingSchemeId: validatedData.markingSchemeId,
      }
    })

    return NextResponse.json({ subject: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update subject' }, { status: 400 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const existing = await prisma.subject.findUnique({ where: { id: params.id } })
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    }

    await prisma.subject.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 })
  }
}
