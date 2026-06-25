import { GoogleGenerativeAI } from '@google/generative-ai';

export interface QuestionData {
  text: string;
}

export interface TaggedQuestion {
  text: string;
  topics: string[];
  difficulty: string;
}

export interface PYQAnalysisResult {
  questions: TaggedQuestion[];
  frequency: Record<string, number>;
  importanceRanking: { topic: string; score: number }[];
}

export async function analyzePYQWeightage(questions: QuestionData[]): Promise<PYQAnalysisResult> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
You are an expert academic assistant.
I will provide you with a list of questions from previous year question papers (PYQs).
For each question, I want you to:
1. Identify 1-3 core topics/concepts being tested.
2. Classify the difficulty as Easy, Medium, or Hard based on typical university standards.

Return the result EXACTLY as a JSON array of objects, with no markdown formatting.
Schema:
[
  {
    "text": "original question text",
    "topics": ["topic1", "topic2"],
    "difficulty": "Easy"
  }
]

Questions:
${JSON.stringify(questions, null, 2)}
  `;

  try {
    const response = await model.generateContent(prompt);
    const resultText = response.response.text().trim();
    const cleanedText = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const taggedQuestions: TaggedQuestion[] = JSON.parse(cleanedText);

    // Frequency Analysis
    const frequency: Record<string, number> = {};
    taggedQuestions.forEach(q => {
      if (Array.isArray(q.topics)) {
        q.topics.forEach(t => {
          const normalized = t.toLowerCase().trim();
          frequency[normalized] = (frequency[normalized] || 0) + 1;
        });
      }
    });

    // Importance Ranking
    const importanceRanking = Object.entries(frequency)
      .map(([topic, score]) => ({ topic, score }))
      .sort((a, b) => b.score - a.score);

    return {
      questions: taggedQuestions,
      frequency,
      importanceRanking
    };
  } catch (error: any) {
    console.error('PYQ Analysis failed:', error);
    throw new Error('Failed to analyze PYQs: ' + error.message);
  }
}
