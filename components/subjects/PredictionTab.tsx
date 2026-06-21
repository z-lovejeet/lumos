import { predictGrade, calculateRequiredMarks } from '@/lib/predictions/grade-predictor';
import { GradeRange } from '@/lib/calculations/sgpa';
import { CalculationComponent } from '@/lib/calculations/percentage';
import { Progress } from '@/components/ui/progress';
import { FeasibilityBadge } from '@/components/simulator/FeasibilityBadge';

export function PredictionTab({ subject, gradeScale }: { subject: any, gradeScale: any[] }) {
  if (!subject.markingScheme) {
    return (
      <div className="p-6 text-center text-muted-foreground border rounded-lg m-6">
        No marking scheme attached to this subject. Add a marking scheme to see predictions.
      </div>
    );
  }

  // Parse grade scale
  const scaleRanges: GradeRange[] = gradeScale.map((g: any) => ({
    grade: g.grade,
    minPercentage: g.minPercent,
    maxPercentage: 100,
    gpaValue: g.point
  }));
  scaleRanges.sort((a, b) => b.minPercentage - a.minPercentage);
  for (let i = 1; i < scaleRanges.length; i++) {
    scaleRanges[i].maxPercentage = scaleRanges[i - 1].minPercentage - 0.01;
  }
  scaleRanges[0].maxPercentage = 100;

  const components = subject.markingScheme.components as CalculationComponent[];
  const prediction = predictGrade(subject.marks || [], components, scaleRanges);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h3 className="text-xl font-bold mb-4">Grade Prediction</h3>
        <p className="text-muted-foreground mb-6">
          Based on your current performance and remaining assessments.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 border rounded-xl p-6 bg-primary/5">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Predicted Grade</span>
            <span className="text-4xl font-black text-primary">{prediction.predictedGrade}</span>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Predicted Percentage</span>
              <span className="font-bold">{prediction.predictedPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={prediction.predictedPercentage} className="h-2" />
          </div>
        </div>

        <div className="space-y-4 border rounded-xl p-6">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Best Possible Grade</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {prediction.bestPossibleGrade} ({prediction.bestPossiblePercentage.toFixed(0)}%)
              </span>
            </div>
            <Progress value={prediction.bestPossiblePercentage} className="h-2 bg-emerald-100 dark:bg-emerald-950 [&>div]:bg-emerald-600 dark:[&>div]:bg-emerald-400" />
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Worst Possible Grade</span>
              <span className="font-semibold text-destructive">
                {prediction.worstPossibleGrade} ({prediction.worstPossiblePercentage.toFixed(0)}%)
              </span>
            </div>
            <Progress value={prediction.worstPossiblePercentage} className="h-2 bg-destructive/20 [&>div]:bg-destructive" />
          </div>
        </div>
      </div>

      {prediction.isFeasible && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Required Marks for Target Grades</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            See what you need to score in your remaining assessments to achieve a specific grade.
          </p>
          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Target Grade</th>
                  <th className="px-4 py-3 font-medium">Required Weight</th>
                  <th className="px-4 py-3 font-medium">Feasibility</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {scaleRanges.map((g) => {
                  const req = calculateRequiredMarks(g.minPercentage, subject.marks || [], components);
                  
                  // Skip grades that are lower than the worst possible grade, as they are guaranteed
                  if (g.minPercentage < prediction.worstPossiblePercentage && g.grade !== prediction.worstPossibleGrade) return null;
                  
                  return (
                    <tr key={g.grade} className="bg-card hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-bold">{g.grade}</td>
                      <td className="px-4 py-3">
                        {req.marksNeededInRemaining <= 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Already Achieved!</span>
                        ) : (
                          <span>
                            Need <strong className="text-primary">{req.marksNeededInRemaining.toFixed(1)}</strong> / {req.totalRemainingWeight.toFixed(1)} weight in remaining assessments
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {req.marksNeededInRemaining > 0 && (
                          <FeasibilityBadge isFeasible={req.isFeasible} requiredScoreFraction={req.requiredScoreFraction} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
