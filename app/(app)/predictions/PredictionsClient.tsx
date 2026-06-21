'use client';

import { useMemo } from 'react';
import { GradeRange } from '@/lib/calculations/sgpa';
import { CalculationComponent } from '@/lib/calculations/percentage';
import { predictGrade } from '@/lib/predictions/grade-predictor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PredictionsClientProps {
  subjects: any[];
  gradeScale: any[];
}

export function PredictionsClient({ subjects, gradeScale }: PredictionsClientProps) {
  // Parse grade scale
  const scaleRanges: GradeRange[] = gradeScale.map((g) => ({
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

  const predictions = useMemo(() => {
    return subjects.map(sub => {
      let components: CalculationComponent[] = [];
      if (sub.markingScheme?.components) {
        components = sub.markingScheme.components as CalculationComponent[];
      }
      
      const prediction = predictGrade(sub.marks || [], components, scaleRanges);
      return { subject: sub, prediction };
    });
  }, [subjects, scaleRanges]);

  if (subjects.length === 0) {
    return (
      <div className="mt-8 border rounded-lg p-12 text-center text-muted-foreground">
        No subjects found in the active semester. Add subjects and marks to see predictions.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
      {predictions.map(({ subject, prediction }) => (
        <Card key={subject.id} className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <div className="text-4xl font-black text-primary/10">
              {prediction.predictedGrade}
            </div>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">{subject.code}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-1">{subject.name}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Predicted</span>
                  <span className="font-bold">{prediction.predictedPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={prediction.predictedPercentage} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-2 border-t text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Best Case</p>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {prediction.bestPossibleGrade}
                    </span>
                    <span className="text-xs text-muted-foreground">({prediction.bestPossiblePercentage.toFixed(0)}%)</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Worst Case</p>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-destructive">
                      {prediction.worstPossibleGrade}
                    </span>
                    <span className="text-xs text-muted-foreground">({prediction.worstPossiblePercentage.toFixed(0)}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
