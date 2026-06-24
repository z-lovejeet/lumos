import { NextResponse } from 'next/server';
import { analyzePYQWeightage, QuestionData } from '@/lib/ai/pyq-analyzer';

export async function POST(req: Request) {
  try {
    const { questions } = await req.json();
    
    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const result = await analyzePYQWeightage(questions as QuestionData[]);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('PYQ API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
