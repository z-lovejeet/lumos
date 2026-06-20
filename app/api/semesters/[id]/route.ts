import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { semesterSchema } from '@/lib/validators'

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
    const semester = await prisma.semester.findUnique({
      where: { id: params.id },
      include: { subjects: true }
    })

    if (!semester || semester.userId !== user.id) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 })
    }

    return NextResponse.json({ semester })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch semester' }, { status: 500 })
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
    const validatedData = semesterSchema.parse(body)

    const existing = await prisma.semester.findUnique({ where: { id: params.id } })
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 })
    }

    if (validatedData.isActive && !existing.isActive) {
      await prisma.semester.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false }
      })
    }

    const updated = await prisma.semester.update({
      where: { id: params.id },
      data: {
        name: validatedData.name,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        isActive: validatedData.isActive,
      }
    })

    return NextResponse.json({ semester: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update semester' }, { status: 400 })
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
    const existing = await prisma.semester.findUnique({ where: { id: params.id } })
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 })
    }

    await prisma.semester.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete semester' }, { status: 500 })
  }
}
