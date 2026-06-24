import { parseTranscriptText } from '@/lib/ai/transcript-parser';

describe('Transcript Parser', () => {
  it('extracts multiple subjects correctly using regex', async () => {
    const rawText = `
    Some University Transcript
    Semester 4
    Data Structures 4 A+
    Algorithms 3 B
    Computer Networks 4 O
    SGPA 8.5
    `;

    const result = await parseTranscriptText(rawText);
    expect(result.sgpa).toBe(8.5);
    expect(result.subjects).toHaveLength(3);
    expect(result.subjects[0].name).toBe('Data Structures');
    expect(result.subjects[0].credits).toBe(4);
    expect(result.subjects[0].grade).toBe('A+');
    
    expect(result.subjects[2].name).toBe('Computer Networks');
    expect(result.subjects[2].grade).toBe('O');
  });

  it('handles empty text gracefully', async () => {
    const result = await parseTranscriptText('');
    expect(result.subjects).toHaveLength(0);
    expect(result.sgpa).toBeUndefined();
  });
  
  it('handles corrupted lines and ignores them', async () => {
    const rawText = `
    Messy Line 4A
    Proper Subject 3 A
    Random Garbage Data
    Another Proper 4 B+
    `;
    const result = await parseTranscriptText(rawText);
    expect(result.subjects).toHaveLength(2);
    expect(result.subjects[0].name).toBe('Proper Subject');
    expect(result.subjects[1].name).toBe('Another Proper');
  });
});
