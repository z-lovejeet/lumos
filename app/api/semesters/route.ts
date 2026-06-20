import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { semesterSchema } from '@/lib/validators'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const semesters = await prisma.semester.findMany({
      where: { userId: user.id },
      orderBy: { startDate: 'desc' },
      include: {
        subjects: true
      }
    })
    return NextResponse.json({ semesters })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch semesters' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validatedData = semesterSchema.parse(body)

    const count = await prisma.semester.count({ where: { userId: user.id } })

    const newSemester = await prisma.semester.create({
      data: {
        userId: user.id,
        number: count + 1,
        name: validatedData.name,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
      }
    })

    return NextResponse.json({ semester: newSemester }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create semester' }, { status: 400 })
  }
}
