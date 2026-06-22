import { NextResponse } from 'next/server';
import { analyzeCreditImpact } from '@/lib/strategy/credit-impact';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subjectIdToDrop, currentSubjects, gradeScale, pastSemesters } = body;

    if (!subjectIdToDrop || !currentSubjects || !gradeScale || !pastSemesters) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const impact = analyzeCreditImpact(subjectIdToDrop, currentSubjects, gradeScale, pastSemesters);

    return NextResponse.json(impact);
  } catch (error: any) {
    console.error('Credit impact analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze credit impact' }, { status: 500 });
  }
}
