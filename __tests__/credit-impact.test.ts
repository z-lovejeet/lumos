import { analyzeCreditImpact } from '../lib/strategy/credit-impact';

describe('Credit Impact Analyzer', () => {
  it('should correctly calculate impact based on credits', () => {
    const subjects = [
      { id: 's1', credits: 4 },
      { id: 's2', credits: 3 },
      { id: 's3', credits: 1 }
    ];
    
    const results = analyzeCreditImpact(subjects, 8);
    
    // s1: 4 credits out of 8. 1 grade drop = 4/8 = 0.5 impact
    expect(results[0].subjectId).toBe('s1');
    expect(results[0].singleGradeDropImpact).toBe(0.5);
    expect(results[0].isHighRisk).toBe(true);

    // s3: 1 credit out of 8. 1 grade drop = 1/8 = 0.125 -> 0.13
    const s3Result = results.find(r => r.subjectId === 's3');
    expect(s3Result?.singleGradeDropImpact).toBe(0.13);
    expect(s3Result?.isHighRisk).toBe(false);
  });

  it('should return empty array for 0 total credits', () => {
    const results = analyzeCreditImpact([{ id: 's1', credits: 0 }], 0);
    expect(results.length).toBe(0);
  });
});
