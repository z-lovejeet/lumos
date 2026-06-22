import { describe, it, expect } from 'vitest';
import { calculateAttendancePercent, predictAttendanceBuffer, calculateAttendanceMarks } from '../../../lib/calculations/attendance';

describe('attendance calculations', () => {
  it('calculates attendance percent correctly', () => {
    expect(calculateAttendancePercent(15, 20)).toBe(75);
    expect(calculateAttendancePercent(0, 0)).toBe(100);
  });

  it('predicts attendance buffer safely above target', () => {
    const result = predictAttendanceBuffer(18, 20, 75);
    expect(result.canMiss).toBe(4);
    expect(result.needToAttend).toBe(0);
    expect(result.status).toBe('safe');
  });

  it('predicts attendance buffer dangerously close to target', () => {
    const result = predictAttendanceBuffer(15, 20, 75);
    expect(result.canMiss).toBe(0);
    expect(result.needToAttend).toBe(0);
    expect(result.status).toBe('danger');
  });

  it('predicts attendance buffer below target (critical)', () => {
    const result = predictAttendanceBuffer(10, 20, 75);
    // Needs 75% -> targetFraction = 0.75
    // needToAttend = (0.75 * 20 - 10) / 0.25 = (15 - 10) / 0.25 = 5 / 0.25 = 20
    expect(result.canMiss).toBe(0);
    expect(result.needToAttend).toBe(20);
    expect(result.status).toBe('critical');
  });

  it('calculates attendance marks based on scale', () => {
    const scale = [
      { min: 95, max: 100, marks: 5 },
      { min: 90, max: 94.99, marks: 4 },
      { min: 85, max: 89.99, marks: 3 },
      { min: 80, max: 84.99, marks: 2 },
      { min: 75, max: 79.99, marks: 1 },
      { min: 0, max: 74.99, marks: 0 }
    ];
    
    expect(calculateAttendanceMarks(96, 5, scale)).toBe(5);
    expect(calculateAttendanceMarks(86, 5, scale)).toBe(3);
    expect(calculateAttendanceMarks(70, 5, scale)).toBe(0);
  });
});
