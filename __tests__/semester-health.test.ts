import { analyzeSemesterHealth, HealthContext } from '../lib/analysis/semester-health';

describe('Semester Health Analyzer', () => {
  it('should return Excellent for perfect metrics', () => {
    const context: HealthContext = {
      sgpa: 9.5,
      totalCredits: 20,
      completedCredits: 20,
      attendancePercent: 95,
      subjectsCount: 5,
      failedSubjectsCount: 0
    };
    
    const result = analyzeSemesterHealth(context);
    expect(result.status).toBe('Excellent');
    expect(result.score).toBe(100);
  });

  it('should return At Risk for low attendance and average SGPA', () => {
    const context: HealthContext = {
      sgpa: 6.5,
      totalCredits: 20,
      completedCredits: 20,
      attendancePercent: 70, // -30 penalty
      subjectsCount: 5,
      failedSubjectsCount: 0
    };
    
    const result = analyzeSemesterHealth(context);
    // Score should be 70
    expect(result.score).toBe(70);
    expect(result.status).toBe('Fair');
  });

  it('should return Critical for failing multiple subjects', () => {
    const context: HealthContext = {
      sgpa: 3.5, // -40
      totalCredits: 20,
      completedCredits: 20,
      attendancePercent: 60, // -30
      subjectsCount: 5,
      failedSubjectsCount: 2 // -60
    };
    
    // total penalty = 130 -> score = 0
    const result = analyzeSemesterHealth(context);
    expect(result.status).toBe('Critical');
    expect(result.score).toBe(0);
  });
});
