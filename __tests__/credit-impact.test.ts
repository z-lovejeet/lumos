import { analyzeCreditImpact, CurrentSemesterSubjects, SemesterHistory } from '../lib/strategy/credit-impact';
import { GradeRange } from '../lib/calculations/sgpa';

describe('Credit Impact Analysis', () => {
  const mockGradeScale: GradeRange[] = [
    { grade: 'A', minPercentage: 80, maxPercentage: 100, gpaValue: 4.0 },
    { grade: 'B', minPercentage: 60, maxPercentage: 79.99, gpaValue: 3.0 },
    { grade: 'F', minPercentage: 0, maxPercentage: 59.99, gpaValue: 0.0 }
  ];

  it('should calculate positive impact when dropping a failing subject', () => {
    const past: SemesterHistory[] = [{ sgpa: 3.0, totalCredits: 10 }];
    const current: CurrentSemesterSubjects[] = [
      { id: '1', name: 'Math', credits: 4, predictedPercentage: 85 }, // A (4.0)
      { id: '2', name: 'Physics', credits: 4, predictedPercentage: 30 } // F (0.0)
    ];

    const impact = analyzeCreditImpact('2', current, mockGradeScale, past);
    
    // original SGPA: (16 + 0) / 8 = 2.0
    // new SGPA: 16 / 4 = 4.0
    expect(impact.originalSgpa).toBe(2.0);
    expect(impact.newSgpa).toBe(4.0);
    expect(impact.sgpaDiff).toBe(2.0);
    expect(impact.isPositive).toBe(true);
  });

  it('should calculate negative impact when dropping a high scoring subject', () => {
    const past: SemesterHistory[] = [{ sgpa: 3.0, totalCredits: 10 }];
    const current: CurrentSemesterSubjects[] = [
      { id: '1', name: 'Math', credits: 4, predictedPercentage: 85 }, // A (4.0)
      { id: '2', name: 'Physics', credits: 4, predictedPercentage: 30 } // F (0.0)
    ];

    const impact = analyzeCreditImpact('1', current, mockGradeScale, past);
    
    // original SGPA: 2.0
    // new SGPA: 0 / 4 = 0.0
    expect(impact.originalSgpa).toBe(2.0);
    expect(impact.newSgpa).toBe(0.0);
    expect(impact.sgpaDiff).toBe(-2.0);
    expect(impact.isPositive).toBe(false);
  });
});
