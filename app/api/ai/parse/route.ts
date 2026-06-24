import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import { parseTranscriptText } from '@/lib/ai/transcript-parser';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 10MB limit' }, { status: 400 });
    }

    // Validate type
    const validTypes = ['application/pdf'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF allowed for this endpoint.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF text
    let pdfData;
    try {
      pdfData = await pdfParse(buffer);
    } catch (e: any) {
      return NextResponse.json({ error: 'Failed to extract text from PDF. It might be a scanned image without text layers.' }, { status: 400 });
    }
    
    const text = pdfData.text;
    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'No text found in PDF.' }, { status: 400 });
    }

    // Parse Transcript using Regex + LLM
    const parsedData = await parseTranscriptText(text);

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Parse API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse file' }, { status: 500 });
  }
}
