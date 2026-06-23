import { RuleEngineContext } from './rule-engine';

export function compressAcademicData(context: RuleEngineContext): string {
  // Compress JSON deeply to reduce token usage
  const compactSubjects = context.strategyData.subjects.map(s => ({
    n: s.name,
    c: s.credits,
    m: s.marks.map(m => `${m.componentName}:${m.obtainedMarks}/${m.maxMarks}`).join(','),
    w: s.components.map(c => `${c.name}:${c.weight}%`).join(',')
  }));

  const data = {
    sgpa: context.currentSgpa.toFixed(2),
    trend: context.sgpaTrend,
    scale: context.strategyData.gradeScale.map(g => `${g.grade}:${g.minPercentage}%=${g.gpaValue}`),
    subs: compactSubjects
  };

  return JSON.stringify(data);
}

export function buildAcademicSystemPrompt(context: RuleEngineContext): string {
  const compressedData = compressAcademicData(context);
  
  return `You are AcademiQ, a highly intelligent AI academic advisor. 
You act as a personal "Jarvis" for the student.

Here is the student's current academic data in compressed JSON format:
${compressedData}

Rules for answering:
1. Be extremely concise. Maximum 2-3 short paragraphs.
2. Provide data-driven answers. Do the math! If they ask how to get a specific grade, reference the 'subs' (subjects) array. 
  - 'm' is marks obtained (e.g. Midterm:20/50).
  - 'w' is weightage (e.g. Midterm:50%).
3. Tone: Direct, encouraging, and analytical. Don't use overly robotic language.
4. If asked about something not in the data, gently clarify you only have access to their current semester data.
5. Do NOT hallucinate grades or marks. If a component is missing marks, assume it hasn't been evaluated yet.`;
}
