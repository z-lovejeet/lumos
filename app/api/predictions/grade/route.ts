import { NextResponse } from 'next/server';
import { predictGrade } from '@/lib/predictions/grade-predictor';
import { CalculationComponent, CalculationMark } from '@/lib/calculations/percentage';
import { GradeRange } from '@/lib/calculations/sgpa';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { marks, components, gradeScale } = body as {
      marks: CalculationMark[];
      components: CalculationComponent[];
      gradeScale: GradeRange[];
    };

    if (!marks || !components || !gradeScale) {
      return NextResponse.json({ error: 'Missing required parameters: marks, components, or gradeScale' }, { status: 400 });
    }

    const prediction = predictGrade(marks, components, gradeScale);

    return NextResponse.json(prediction);
  } catch (error: any) {
    console.error('Error predicting grade:', error);
    return NextResponse.json({ error: 'Failed to predict grade', details: error.message }, { status: 500 });
  }
}
