import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export interface ParsedSubject {
  name: string;
  credits: number;
  grade?: string;
  internalMarks?: number;
  externalMarks?: number;
  totalMarks?: number;
}

export interface ParsedTranscript {
  semester?: number;
  sgpa?: number;
  subjects: ParsedSubject[];
}

export async function parseTranscriptText(text: string): Promise<ParsedTranscript> {
  const subjects: ParsedSubject[] = [];
  
  // Try Regex First for SGPA
  const sgpaMatch = text.match(/SGPA[\s:]*([0-9.]+)/i);
  const sgpa = sgpaMatch ? parseFloat(sgpaMatch[1]) : undefined;

  // Try Regex First for Subjects
  // Matches simple formats like "Data Structures 4 A"
  const lines = text.split('\n');
  let regexSuccessCount = 0;
  for (const line of lines) {
    const lineMatch = line.match(/^([A-Za-z0-9\-\s]+)\s+(\d)\s+([O|S|A|B|C|D|E|F][+]?)$/i);
    if (lineMatch) {
      subjects.push({
        name: lineMatch[1].trim(),
        credits: parseInt(lineMatch[2], 10),
        grade: lineMatch[3].toUpperCase(),
      });
      regexSuccessCount++;
    }
  }

  // If Regex successfully found multiple structured subjects, return it early
  if (regexSuccessCount >= 3) {
    return { sgpa, subjects };
  }

  // Fallback to LLM if regex fails (which is highly likely for complex transcripts)
  if (!GEMINI_API_KEY) {
    console.warn('No Gemini API key available for LLM fallback, returning regex results');
    return { sgpa, subjects };
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
You are an academic transcript parsing assistant.
Extract the subjects, credits, and grades from the following raw transcript text.
Also extract the SGPA if available.
Return the result EXACTLY as a JSON object matching this schema, with no markdown formatting or backticks:
{
  "semester": 1,
  "sgpa": 8.5,
  "subjects": [
    {
      "name": "Subject Name",
      "credits": 3,
      "grade": "A+"
    }
  ]
}

Raw Text:
${text}
`;

  try {
    const response = await model.generateContent(prompt);
    const resultText = response.response.text().trim();
    const cleanedText = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);
    
    return {
      semester: parsedData.semester,
      sgpa: parsedData.sgpa || sgpa,
      subjects: parsedData.subjects || []
    };
  } catch (error) {
    console.error('LLM Fallback parsing failed:', error);
    // If all fails, return whatever regex managed to pick up
    return { sgpa, subjects };
  }
}
