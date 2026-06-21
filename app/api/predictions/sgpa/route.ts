import { NextResponse } from 'next/server';
import { calculateSGPA, SubjectForSGPA, GradeRange } from '@/lib/calculations/sgpa';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subjects, gradeScale } = body as {
      subjects: SubjectForSGPA[];
      gradeScale: GradeRange[];
    };

    if (!subjects || !gradeScale) {
      return NextResponse.json({ error: 'Missing required parameters: subjects or gradeScale' }, { status: 400 });
    }

    const sgpa = calculateSGPA(subjects, gradeScale);

    return NextResponse.json({ sgpa });
  } catch (error: any) {
    console.error('Error predicting SGPA:', error);
    return NextResponse.json({ error: 'Failed to predict SGPA', details: error.message }, { status: 500 });
  }
}
