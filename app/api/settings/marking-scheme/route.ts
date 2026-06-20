import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { markingSchemeSchema } from '@/lib/validators'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const schemes = await prisma.markingScheme.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ schemes })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch marking schemes' }, { status: 500 })
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
    const validatedData = markingSchemeSchema.parse(body)

    const newScheme = await prisma.markingScheme.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        components: validatedData.components
      }
    })

    return NextResponse.json({ scheme: newScheme }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create marking scheme' }, { status: 400 })
  }
}
