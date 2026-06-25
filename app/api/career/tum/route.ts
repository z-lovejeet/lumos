import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const plan = await prisma.careerPlan.findFirst({
      where: { userId: user.id, type: 'tum' }
    });
    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch TUM plan' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { data, progress } = body;

    const existing = await prisma.careerPlan.findFirst({
      where: { userId: user.id, type: 'tum' }
    });

    if (existing) {
      const updated = await prisma.careerPlan.update({
        where: { id: existing.id },
        data: { data, progress }
      });
      return NextResponse.json({ plan: updated });
    } else {
      const created = await prisma.careerPlan.create({
        data: {
          userId: user.id,
          type: 'tum',
          data,
          progress: progress || 0
        }
      });
      return NextResponse.json({ plan: created }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save TUM plan' }, { status: 500 });
  }
}
