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
      where: { userId: user.id, type: 'internship' }
    });
    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch internship plan' }, { status: 500 });
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

    // Security check: ensure data is an object and not excessively large (max ~100KB)
    if (!data || typeof data !== 'object' || Array.isArray(data) || JSON.stringify(data).length > 100000) {
      return NextResponse.json({ error: 'Invalid or excessively large payload' }, { status: 400 });
    }

    const existing = await prisma.careerPlan.findFirst({
      where: { userId: user.id, type: 'internship' }
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
          type: 'internship',
          data,
          progress: progress || 0
        }
      });
      return NextResponse.json({ plan: created }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save internship plan' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { data, progress } = body;

    // Security check
    if (!data || typeof data !== 'object' || Array.isArray(data) || JSON.stringify(data).length > 100000) {
      return NextResponse.json({ error: 'Invalid or excessively large payload' }, { status: 400 });
    }

    const existing = await prisma.careerPlan.findFirst({
      where: { userId: user.id, type: 'internship' }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Merge existing data with new data (shallow merge)
    const mergedData = { ...(existing.data as object), ...data };

    const updated = await prisma.careerPlan.update({
      where: { id: existing.id },
      data: {
        data: mergedData,
        progress: progress !== undefined ? progress : existing.progress
      }
    });

    return NextResponse.json({ plan: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update internship plan' }, { status: 500 });
  }
}
