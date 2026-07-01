export interface PredictorComponent {
  name: string;
  maxMarks: number;
  weight: number;
}

export interface PredictionResult {
  feasible: boolean;
  secured: boolean;
  margin: number;
  neededWeight: number;
  remainingWeight: number;
  achievedWeight: number;
  distribution: Record<string, number>;
  message: string;
}

const EPSILON = 0.0001;

export function calculateTarget(
  targetPercent: number,
  components: PredictorComponent[],
  simulatedMarks: Record<string, number | null | undefined>
): PredictionResult {
  let achievedWeight = 0;
  let remainingWeight = 0;
  const emptyComponents: PredictorComponent[] = [];

  // 1. Calculate knowns and unknowns
  for (const comp of components) {
    if (comp.maxMarks <= 0 || comp.weight <= 0) {
      continue; // Skip invalid components
    }

    const mark = simulatedMarks[comp.name];
    if (typeof mark === 'number' && !isNaN(mark)) {
      // User entered a valid mark (or it was imported)
      // Clamp the mark between 0 and maxMarks to be safe
      const clampedMark = Math.max(0, Math.min(mark, comp.maxMarks));
      achievedWeight += (clampedMark / comp.maxMarks) * comp.weight;
    } else {
      emptyComponents.push(comp);
      remainingWeight += comp.weight;
    }
  }

  const neededWeight = targetPercent - achievedWeight;
  const margin = remainingWeight - neededWeight;

  const distribution: Record<string, number> = {};

  // 2. Check if secured
  if (neededWeight <= EPSILON) {
    // Target is already hit with existing marks
    emptyComponents.forEach((comp) => {
      distribution[comp.name] = 0;
    });

    return {
      feasible: true,
      secured: true,
      margin: remainingWeight + Math.abs(neededWeight),
      neededWeight,
      remainingWeight,
      achievedWeight,
      distribution,
      message: 'Target Secured! You already have enough marks.'
    };
  }

  // 3. Check feasibility
  if (neededWeight > remainingWeight + EPSILON) {
    // Target is impossible
    emptyComponents.forEach((comp) => {
      distribution[comp.name] = comp.maxMarks; // Just fill it out max, but it's impossible
    });

    return {
      feasible: false,
      secured: false,
      margin,
      neededWeight,
      remainingWeight,
      achievedWeight,
      distribution,
      message: `Impossible. You need ${neededWeight.toFixed(2)}% more, but only ${remainingWeight.toFixed(2)}% weight remains.`
    };
  }

  // 4. Distribute proportional marks
  // Required Raw Mark = maxMarks * (neededWeight / remainingWeight)
  const ratio = neededWeight / remainingWeight;
  emptyComponents.forEach((comp) => {
    const requiredMark = comp.maxMarks * ratio;
    // We shouldn't exceed maxMarks (in case of float weirdness, cap at maxMarks)
    distribution[comp.name] = Math.min(comp.maxMarks, requiredMark);
  });

  return {
    feasible: true,
    secured: false,
    margin,
    neededWeight,
    remainingWeight,
    achievedWeight,
    distribution,
    message: `Feasible. You can lose up to ${margin.toFixed(2)}% in the remaining assessments.`
  };
}
