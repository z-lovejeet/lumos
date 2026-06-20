import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { subjectSchema } from '@/lib/validators'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const subjects = await prisma.subject.findMany({
      where: { userId: user.id },
      include: { semester: { select: { name: true } } },
      orderBy: { code: 'asc' }
    })
    return NextResponse.json({ subjects })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 })
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
    const validatedData = subjectSchema.parse(body)

    const semester = await prisma.semester.findUnique({
      where: { id: validatedData.semesterId }
    })
    
    if (!semester || semester.userId !== user.id) {
      return NextResponse.json({ error: 'Invalid semester' }, { status: 400 })
    }

    let components: any[] = []
    if (validatedData.markingSchemeId) {
      const scheme = await prisma.markingScheme.findUnique({
        where: { id: validatedData.markingSchemeId }
      })
      if (scheme && scheme.components) {
        components = scheme.components as any[]
      }
    }

    const newSubject = await prisma.subject.create({
      data: {
        userId: user.id,
        semesterId: validatedData.semesterId,
        code: validatedData.code,
        name: validatedData.name,
        credits: validatedData.credits,
        category: validatedData.category,
        facultyName: validatedData.facultyName,
        markingSchemeId: validatedData.markingSchemeId,
        marks: {
          create: components.map((comp) => ({
            componentName: comp.name,
            maxMarks: comp.maxMarks,
            obtainedMarks: null,
          }))
        }
      }
    })

    return NextResponse.json({ subject: newSubject }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create subject' }, { status: 400 })
  }
}
