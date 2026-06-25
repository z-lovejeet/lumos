import { mapCurriculum, CurriculumRequirement } from '@/lib/career/curriculum-mapper';

describe('Curriculum Mapper Algorithm', () => {
  const tumRequirements: CurriculumRequirement[] = [
    { id: '1', category: 'Mathematics', requiredCredits: 16 },
    { id: '2', category: 'Computer Science', requiredCredits: 30 },
  ];

  it('correctly maps exactly matched categories', () => {
    const subjects = [
      { name: 'Calculus I', category: 'Mathematics', credits: 8 },
      { name: 'Linear Algebra', category: 'Mathematics', credits: 8 },
      { name: 'Data Structures', category: 'Computer Science', credits: 15 },
    ];

    const results = mapCurriculum(subjects, tumRequirements);

    const math = results.find(r => r.category === 'Mathematics');
    expect(math?.completedCredits).toBe(16);
    expect(math?.isMet).toBe(true);

    const cs = results.find(r => r.category === 'Computer Science');
    expect(cs?.completedCredits).toBe(15);
    expect(cs?.isMet).toBe(false);
  });

  it('matches using partial name inclusion if category differs', () => {
    const subjects = [
      { name: 'Advanced Mathematics', category: 'General', credits: 10 },
      { name: 'Introduction to Computer Science', category: 'Basics', credits: 30 }
    ];

    const results = mapCurriculum(subjects, tumRequirements);

    const math = results.find(r => r.category === 'Mathematics');
    expect(math?.completedCredits).toBe(10);
    expect(math?.isMet).toBe(false);

    const cs = results.find(r => r.category === 'Computer Science');
    expect(cs?.completedCredits).toBe(30);
    expect(cs?.isMet).toBe(true);
  });

  it('handles empty subjects gracefully', () => {
    const results = mapCurriculum([], tumRequirements);
    
    results.forEach(res => {
      expect(res.completedCredits).toBe(0);
      expect(res.isMet).toBe(false);
      expect(res.matchedSubjects).toHaveLength(0);
    });
  });
});
