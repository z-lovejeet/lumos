import { calculateTarget, PredictorComponent } from '../predictor';

describe('Predictor Calculation Engine', () => {
  const components: PredictorComponent[] = [
    { name: 'CA1', maxMarks: 20, weight: 15 },
    { name: 'MidTerm', maxMarks: 50, weight: 25 },
    { name: 'Final', maxMarks: 100, weight: 60 }
  ];

  it('should calculate required marks correctly for feasible targets', () => {
    // Want 80%. Achieved CA1 (15/20) => (15/20)*15 = 11.25%
    // Needed: 80 - 11.25 = 68.75%
    // Remaining weight = 85
    const result = calculateTarget(80, components, { CA1: 15 });
    
    expect(result.feasible).toBe(true);
    expect(result.secured).toBe(false);
    expect(result.achievedWeight).toBeCloseTo(11.25);
    expect(result.neededWeight).toBeCloseTo(68.75);
    expect(result.remainingWeight).toBe(85);
    
    // Distribution Check
    // MidTerm Ratio = 68.75 / 85
    // Final Ratio = 68.75 / 85
    expect(result.distribution['MidTerm']).toBeCloseTo(50 * (68.75 / 85));
    expect(result.distribution['Final']).toBeCloseTo(100 * (68.75 / 85));
  });

  it('should flag impossible targets', () => {
    // Want 95%. Achieved CA1 (10/20) => 7.5%
    // Needed: 95 - 7.5 = 87.5%
    // Remaining weight = 85 (MidTerm + Final)
    // 87.5 > 85 => Impossible
    const result = calculateTarget(95, components, { CA1: 10 });
    
    expect(result.feasible).toBe(false);
    expect(result.margin).toBeLessThan(0);
  });

  it('should handle already secured targets', () => {
    // Want 40%. Achieved CA1 (20/20) = 15%, MidTerm (50/50) = 25% => Total 40%
    const result = calculateTarget(40, components, { CA1: 20, MidTerm: 50 });
    
    expect(result.feasible).toBe(true);
    expect(result.secured).toBe(true);
    expect(result.neededWeight).toBeCloseTo(0);
    expect(result.distribution['Final']).toBe(0); // Needs 0 in final to pass
  });

  it('should ignore 0 weight or 0 maxMarks components safely', () => {
    const weirdComponents: PredictorComponent[] = [
      { name: 'Invalid', maxMarks: 0, weight: 0 },
      { name: 'Valid', maxMarks: 100, weight: 100 }
    ];
    
    const result = calculateTarget(50, weirdComponents, {});
    expect(result.feasible).toBe(true);
    expect(result.distribution['Valid']).toBe(50);
    expect(result.distribution['Invalid']).toBeUndefined();
  });

  it('should handle floating point edge cases correctly', () => {
    // Target 90, achieved 30, remaining 60.
    // If achieved + remaining is exactly 90, it should be feasible, not impossible.
    const result = calculateTarget(90, components, { CA1: 20, MidTerm: 30 });
    // CA1 (20/20) * 15 = 15
    // MidTerm (30/50) * 25 = 15
    // Total achieved = 30. Remaining weight = 60. Target = 90. Needed = 60.
    expect(result.feasible).toBe(true);
    expect(result.secured).toBe(false);
    expect(result.distribution['Final']).toBeCloseTo(100);
  });
});
