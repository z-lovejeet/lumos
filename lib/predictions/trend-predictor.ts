/**
 * Performs simple linear regression to predict the next value in a sequence.
 * @param yValues Array of historical data points (e.g., SGPAs)
 * @returns The predicted next value, or null if insufficient data
 */
export function linearRegression(yValues: number[]): number | null {
  const n = yValues.length;
  if (n < 2) return null; // Need at least 2 points for a line

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const x = i + 1; // Time step (1, 2, 3...)
    const y = yValues[i];
    sumX += x;
    sumY += y;
    sumXY += (x * y);
    sumXX += (x * x);
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Predict for next time step
  const nextX = n + 1;
  const prediction = slope * nextX + intercept;

  // Cap SGPA prediction between 0 and 10
  return Math.min(Math.max(prediction, 0), 10);
}

export function predictPerformanceTrend(historicalSgpas: number[]): number | null {
  return linearRegression(historicalSgpas);
}
