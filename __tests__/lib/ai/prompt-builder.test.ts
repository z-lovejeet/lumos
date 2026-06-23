import { buildAcademicSystemPrompt, compressAcademicData } from '@/lib/ai/prompt-builder';
import { RuleEngineContext } from '@/lib/ai/rule-engine';

describe('Prompt Builder', () => {
  const mockContext: RuleEngineContext = {
    currentSgpa: 8.5,
    sgpaTrend: [7.0, 8.0, 8.5],
    strategyData: {
      gradeScale: [
        { grade: 'O', minPercentage: 90, maxPercentage: 100, gpaValue: 10 }
      ],
      subjects: [
        {
          id: 's1',
          name: 'Computer Networks',
          credits: 3,
          marks: [
            { id: 'm1', subjectId: 's1', componentName: 'Midterm', obtainedMarks: 20, maxMarks: 50, examDate: null, createdAt: new Date() }
          ],
          components: [
            { name: 'Midterm', maxMarks: 50, weight: 50, isOptional: false },
            { name: 'Final', maxMarks: 50, weight: 50, isOptional: false }
          ]
        }
      ]
    }
  };

  it('compresses data to JSON format', () => {
    const json = compressAcademicData(mockContext);
    const parsed = JSON.parse(json);
    
    expect(parsed.sgpa).toBe("8.50");
    expect(parsed.trend).toEqual([7.0, 8.0, 8.5]);
    expect(parsed.scale).toContain("O:90%=10");
    expect(parsed.subs.length).toBe(1);
    expect(parsed.subs[0].n).toBe("Computer Networks");
    expect(parsed.subs[0].c).toBe(3);
    expect(parsed.subs[0].m).toBe("Midterm:20/50");
    expect(parsed.subs[0].w).toBe("Midterm:50%,Final:50%");
  });

  it('embeds compressed data into system prompt', () => {
    const prompt = buildAcademicSystemPrompt(mockContext);
    expect(prompt).toContain('You are AcademiQ');
    expect(prompt).toContain('Computer Networks');
    expect(prompt).toContain('Midterm:20/50');
  });
});
