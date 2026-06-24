import { NextResponse } from 'next/server';
import { parseTranscriptText } from '@/lib/ai/transcript-parser';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    // Handle OCR Text Parsing (JSON Payload)
    if (contentType.includes('application/json')) {
      const { text } = await req.json();
      if (!text || typeof text !== 'string') {
        return NextResponse.json({ error: 'Invalid text payload' }, { status: 400 });
      }
      const parsedData = await parseTranscriptText(text);
      return NextResponse.json({ success: true, data: parsedData });
    }

    // Handle PDF Parsing (FormData Payload)
    if (contentType.includes('multipart/form-data')) {
      const pdfParse = require('pdf-parse');
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File exceeds 10MB limit' }, { status: 400 });
      }
      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Invalid file type. Only PDF allowed.' }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      let pdfData;
      try {
        pdfData = await pdfParse(buffer);
      } catch (e: any) {
        return NextResponse.json({ error: 'Failed to extract text from PDF. Scanned images inside PDFs may not be supported.' }, { status: 400 });
      }
      
      if (!pdfData.text || pdfData.text.trim() === '') {
        return NextResponse.json({ error: 'No text found in PDF.' }, { status: 400 });
      }

      const parsedData = await parseTranscriptText(pdfData.text);
      return NextResponse.json({ success: true, data: parsedData });
    }

    return NextResponse.json({ error: 'Unsupported Content-Type. Must be application/json or multipart/form-data' }, { status: 400 });
  } catch (error: any) {
    console.error('Parse API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse data' }, { status: 500 });
  }
}
