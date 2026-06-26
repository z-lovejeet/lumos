import { linearRegression, predictPerformanceTrend } from '../../../lib/predictions/trend-predictor';

describe('Trend Predictor', () => {
  it('should return null if not enough data points', () => {
    expect(linearRegression([])).toBeNull();
    expect(linearRegression([8.5])).toBeNull();
  });

  it('should accurately predict a perfect upward linear trend', () => {
    // y = x + 6
    // [7, 8, 9] -> next should be 10
    const prediction = linearRegression([7, 8, 9]);
    expect(prediction).toBeCloseTo(10, 2);
  });

  it('should cap the prediction at 10.0', () => {
    // [8, 9, 10] -> upward trend would predict 11, but capped at 10
    const prediction = linearRegression([8, 9, 10]);
    expect(prediction).toBe(10);
  });

  it('should accurately predict a downward trend', () => {
    // [9, 8, 7] -> next should be 6
    const prediction = linearRegression([9, 8, 7]);
    expect(prediction).toBeCloseTo(6, 2);
  });

  it('should floor the prediction at 0', () => {
    // [2, 1, 0] -> downward trend would predict -1, but floored at 0
    const prediction = linearRegression([2, 1, 0]);
    expect(prediction).toBe(0);
  });

  it('predictPerformanceTrend should act as an alias to linearRegression', () => {
    const historical = [7.5, 8.0, 8.5];
    const prediction = predictPerformanceTrend(historical);
    expect(prediction).toBeCloseTo(9.0, 2);
  });
});
