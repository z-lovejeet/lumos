export interface CalculationComponent {
  name: string;
  weight: number;
  maxMarks: number;
}

export interface CalculationMark {
  componentName: string;
  obtainedMarks: number | null;
  maxMarks: number;
}

/**
 * Calculates the total weighted percentage for a subject based on entered marks.
 * If marks are null, they contribute 0 to the final percentage.
 */
export function calculateSubjectPercentage(
  marks: CalculationMark[],
  components: CalculationComponent[]
): number {
  if (!components || components.length === 0) return 0;

  let totalPercentage = 0;

  for (const component of components) {
    const mark = marks.find((m) => m.componentName === component.name);
    
    if (mark && mark.obtainedMarks !== null) {
      // Calculate the fraction of marks obtained for this component
      const fraction = mark.obtainedMarks / mark.maxMarks;
      
      // Add the weighted contribution
      totalPercentage += fraction * component.weight;
    }
  }

  // Cap at 100 and round to 2 decimal places
  return Math.min(100, Math.round(totalPercentage * 100) / 100);
}

/**
 * Calculates the percentage only out of the components that have been evaluated (marks entered).
 * Useful for showing "Current Standing" instead of final projected percentage.
 */
export function calculateEvaluatedPercentage(
  marks: CalculationMark[],
  components: CalculationComponent[]
): number {
  if (!components || components.length === 0) return 0;

  let earnedWeight = 0;
  let evaluatedWeight = 0;

  for (const component of components) {
    const mark = marks.find((m) => m.componentName === component.name);
    
    if (mark && mark.obtainedMarks !== null) {
      const fraction = mark.obtainedMarks / mark.maxMarks;
      earnedWeight += fraction * component.weight;
      evaluatedWeight += component.weight;
    }
  }

  if (evaluatedWeight === 0) return 0;
  
  // Scale it up to 100
  const currentStanding = (earnedWeight / evaluatedWeight) * 100;
  return Math.round(currentStanding * 100) / 100;
}
