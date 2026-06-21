import { CalculationComponent, CalculationMark } from '../calculations/percentage';
import { GradeRange, getGradeFromPercentage } from '../calculations/sgpa';

export interface PredictionResult {
  predictedPercentage: number;
  predictedGrade: string;
  bestPossiblePercentage: number;
  bestPossibleGrade: string;
  worstPossiblePercentage: number;
  worstPossibleGrade: string;
  isFeasible: boolean; // True if there are still marks to be earned
}

export interface RequiredMarksResult {
  targetGrade: string;
  requiredPercentage: number;
  marksNeededInRemaining: number;
  totalRemainingWeight: number;
  isFeasible: boolean;
  requiredScoreFraction: number; // e.g. 0.85 means need to score 85% on average in remaining exams
}

/**
 * Predicts the final grade based on current marks and remaining weight.
 * Assumes the student maintains their current performance average for the remaining weight.
 */
export function predictGrade(
  marks: CalculationMark[],
  components: CalculationComponent[],
  gradeScale: GradeRange[]
): PredictionResult {
  let earnedWeight = 0;
  let evaluatedWeight = 0;
  let totalWeight = 0;

  for (const component of components) {
    totalWeight += component.weight;
    const mark = marks.find((m) => m.componentName === component.name);
    
    if (mark && mark.obtainedMarks !== null) {
      const fraction = mark.obtainedMarks / mark.maxMarks;
      earnedWeight += fraction * component.weight;
      evaluatedWeight += component.weight;
    }
  }

  const remainingWeight = totalWeight - evaluatedWeight;
  const hasRemaining = remainingWeight > 0 && remainingWeight <= totalWeight;

  // Best case: score 100% on everything remaining
  const bestPossible = earnedWeight + remainingWeight;
  
  // Worst case: score 0% on everything remaining
  const worstPossible = earnedWeight;

  // Predicted: maintain current average (if evaluated > 0), else assume 80% (optimistic default)
  let predictedPercentage = 0;
  if (evaluatedWeight === 0) {
    predictedPercentage = totalWeight * 0.8; 
  } else {
    const currentAverage = earnedWeight / evaluatedWeight;
    predictedPercentage = earnedWeight + (currentAverage * remainingWeight);
  }

  // Scale back from weight to percentage out of 100
  const bestPercent = Math.min(100, (bestPossible / totalWeight) * 100);
  const worstPercent = Math.min(100, (worstPossible / totalWeight) * 100);
  const predPercent = Math.min(100, (predictedPercentage / totalWeight) * 100);

  return {
    predictedPercentage: Math.round(predPercent * 100) / 100,
    predictedGrade: getGradeFromPercentage(predPercent, gradeScale),
    bestPossiblePercentage: Math.round(bestPercent * 100) / 100,
    bestPossibleGrade: getGradeFromPercentage(bestPercent, gradeScale),
    worstPossiblePercentage: Math.round(worstPercent * 100) / 100,
    worstPossibleGrade: getGradeFromPercentage(worstPercent, gradeScale),
    isFeasible: hasRemaining
  };
}

/**
 * Calculates what marks are needed in the remaining components to hit a target grade.
 */
export function calculateRequiredMarks(
  targetPercentage: number, // The minPercentage of the desired GradeRange
  marks: CalculationMark[],
  components: CalculationComponent[]
): RequiredMarksResult {
  let earnedWeight = 0;
  let evaluatedWeight = 0;
  let totalWeight = 0;

  for (const component of components) {
    totalWeight += component.weight;
    const mark = marks.find((m) => m.componentName === component.name);
    
    if (mark && mark.obtainedMarks !== null) {
      const fraction = mark.obtainedMarks / mark.maxMarks;
      earnedWeight += fraction * component.weight;
      evaluatedWeight += component.weight;
    }
  }

  const remainingWeight = totalWeight - evaluatedWeight;
  
  // What weight do we need out of totalWeight?
  const targetWeight = (targetPercentage / 100) * totalWeight;
  const weightNeeded = targetWeight - earnedWeight;

  // Is it feasible?
  const isFeasible = weightNeeded <= remainingWeight && weightNeeded >= 0;
  // Note: if weightNeeded < 0, they already achieved the target grade even if they score 0 on the rest.
  
  const requiredScoreFraction = remainingWeight > 0 ? (weightNeeded / remainingWeight) : 0;

  return {
    targetGrade: "Custom",
    requiredPercentage: targetPercentage,
    marksNeededInRemaining: Math.max(0, weightNeeded),
    totalRemainingWeight: remainingWeight,
    isFeasible: weightNeeded <= remainingWeight, // even if < 0, it's feasible
    requiredScoreFraction: Math.max(0, requiredScoreFraction)
  };
}
