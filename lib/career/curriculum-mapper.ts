export interface CurriculumRequirement {
  id: string;
  category: string; // e.g., 'Mathematics', 'Computer Science', 'Electives'
  requiredCredits: number;
}

export interface CurriculumMapResult {
  category: string;
  requiredCredits: number;
  completedCredits: number;
  isMet: boolean;
  matchedSubjects: string[];
}

/**
 * Maps completed subjects to target curriculum requirements (e.g. TUM prerequisites).
 */
export function mapCurriculum(
  completedSubjects: { name: string; category: string; credits: number }[],
  requirements: CurriculumRequirement[]
): CurriculumMapResult[] {
  return requirements.map(req => {
    // Find all subjects that map to this requirement's category
    // In a real app, this might use LLM matching or fuzzy string matching.
    // Here we use exact category matching or partial string matching.
    const matched = completedSubjects.filter(sub => 
      sub.category.toLowerCase() === req.category.toLowerCase() ||
      sub.name.toLowerCase().includes(req.category.toLowerCase())
    );

    const completedCredits = matched.reduce((sum, sub) => sum + sub.credits, 0);

    return {
      category: req.category,
      requiredCredits: req.requiredCredits,
      completedCredits,
      isMet: completedCredits >= req.requiredCredits,
      matchedSubjects: matched.map(m => m.name)
    };
  });
}
