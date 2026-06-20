import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { gradeScaleSchema } from '@/lib/validators'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const scales = await prisma.gradeScale.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ scales })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch grade scales' }, { status: 500 })
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
    const validatedData = gradeScaleSchema.parse(body)

    const newScale = await prisma.gradeScale.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        grades: validatedData.ranges
      }
    })

    return NextResponse.json({ scale: newScale }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create grade scale' }, { status: 400 })
  }
}
