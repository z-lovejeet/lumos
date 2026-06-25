import { analyzeMSReadiness } from '@/lib/career/ms-readiness';
import { MSAbroadProfile } from '@/types/career';

describe('MS Readiness Scoring', () => {
  it('calculates 100% for perfect profile', () => {
    const perfectProfile: MSAbroadProfile = {
      targetCountry: 'USA',
      targetTerm: 'Fall 2026',
      greScore: 330,
      toeflIeltsScore: 8.0,
      researchPapers: 2,
      workExperienceMonths: 25
    };
    
    const score = analyzeMSReadiness(9.5, perfectProfile);
    expect(score.academics).toBe(100);
    expect(score.testScores).toBe(100);
    expect(score.experience).toBe(100);
    expect(score.overall).toBe(100);
    expect(score.missingFactors).toHaveLength(0);
  });

  it('identifies missing factors and handles partial scores', () => {
    const poorProfile: MSAbroadProfile = {
      targetCountry: 'Germany',
      targetTerm: 'Winter 2026'
    };
    
    const score = analyzeMSReadiness(7.5, poorProfile);
    expect(score.academics).toBe(50); // (7.5-6)/3 * 100 = 50
    expect(score.testScores).toBe(0);
    expect(score.experience).toBe(0);
    expect(score.overall).toBe(20); // 50 * 0.4
    expect(score.missingFactors).toContain('GRE Score');
    expect(score.missingFactors).toContain('TOEFL/IELTS Score');
    expect(score.missingFactors).toContain('Research Papers');
    expect(score.missingFactors).toContain('Work Experience/Internships');
  });
});
