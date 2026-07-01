'use client';

import { useMemo, useState } from 'react';
import { SubjectPredictionDTO, GradeScaleEntry } from './TargetGradeClient';
import { calculateTarget } from '@/lib/calculations/predictor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StrategyDisplayProps {
  subject: SubjectPredictionDTO;
  simulatedMarks: Record<string, number | null>;
  gradeScale: GradeScaleEntry[];
}

export function StrategyDisplay({ subject, simulatedMarks, gradeScale }: StrategyDisplayProps) {
  const [targetPercentStr, setTargetPercentStr] = useState<string>('80');
  const [targetGrade, setTargetGrade] = useState<string>(gradeScale[0]?.grade || '');

  const components = subject.markingScheme?.components || [];
  
  // Sort grades highest to lowest for display
  const sortedScale = useMemo(() => {
    return [...gradeScale].sort((a, b) => b.minPercent - a.minPercent);
  }, [gradeScale]);

  // Mode 1: All Grades
  const allGradesPrediction = useMemo(() => {
    return sortedScale.map(g => ({
      grade: g.grade,
      minPercent: g.minPercent,
      prediction: calculateTarget(g.minPercent, components, simulatedMarks)
    }));
  }, [sortedScale, components, simulatedMarks]);

  // Mode 2: Target Grade
  const selectedGradeObj = sortedScale.find(g => g.grade === targetGrade);
  const targetGradePrediction = useMemo(() => {
    if (!selectedGradeObj) return null;
    return calculateTarget(selectedGradeObj.minPercent, components, simulatedMarks);
  }, [selectedGradeObj, components, simulatedMarks]);

  // Mode 3: Target Marks (Percent)
  const targetMarksPrediction = useMemo(() => {
    const num = parseFloat(targetPercentStr);
    if (isNaN(num)) return null;
    return calculateTarget(num, components, simulatedMarks);
  }, [targetPercentStr, components, simulatedMarks]);

  if (components.length === 0) {
    return null; // Handled by empty state in parent or left side
  }

  const renderDistributionBox = (prediction: ReturnType<typeof calculateTarget>) => {
    if (prediction.secured) {
      return (
        <div className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 p-4 rounded-md">
          <h4 className="font-bold">Target Secured! 🎉</h4>
          <p className="text-sm">You have already achieved enough marks. You can score 0 in the remaining assessments and still reach this target.</p>
        </div>
      );
    }
    
    if (!prediction.feasible) {
      return (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-md">
          <h4 className="font-bold">Mathematically Impossible</h4>
          <p className="text-sm">You need {prediction.neededWeight.toFixed(1)}% more weight, but only {prediction.remainingWeight.toFixed(1)}% remains.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="bg-primary/5 border p-4 rounded-md space-y-4">
          <div className="flex justify-between items-end">
             <div>
                <p className="text-sm text-muted-foreground">Required Overall Margin</p>
                <p className="text-xl font-bold">Lose max {prediction.margin.toFixed(1)}%</p>
             </div>
             <div className="text-right">
                <p className="text-sm text-muted-foreground">Weight to Target</p>
                <p className="text-xl font-bold">{prediction.neededWeight.toFixed(1)}%</p>
             </div>
          </div>
          
          <div className="pt-2 border-t space-y-3">
            <h4 className="text-sm font-semibold">Recommended Target Marks:</h4>
            {Object.entries(prediction.distribution).map(([compName, requiredMark]) => {
              const comp = components.find(c => c.name === compName);
              if (!comp) return null;
              
              const rawNeeded = requiredMark.toFixed(1);
              const percentage = (requiredMark / comp.maxMarks) * 100;

              return (
                <div key={compName} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{compName}</span>
                    <span className="font-medium">{rawNeeded} / {comp.maxMarks}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Strategy & Predictions</CardTitle>
        <CardDescription>
          See what you need to score in your remaining assessments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all-grades" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all-grades">All Grades</TabsTrigger>
            <TabsTrigger value="target-grade">By Grade</TabsTrigger>
            <TabsTrigger value="target-marks">By Percentage</TabsTrigger>
          </TabsList>

          <TabsContent value="all-grades" className="space-y-4 mt-4">
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {allGradesPrediction.map((item) => {
                const p = item.prediction;
                
                let statusColor = "bg-secondary";
                let statusText = "Possible";
                
                if (p.secured) {
                  statusColor = "bg-emerald-500 text-white";
                  statusText = "Secured";
                } else if (!p.feasible) {
                  statusColor = "bg-destructive text-white";
                  statusText = "Impossible";
                } else if (p.margin < 5) {
                  statusColor = "bg-amber-500 text-white";
                  statusText = "Hard";
                } else if (p.margin > 15) {
                  statusColor = "bg-emerald-500/20 text-emerald-700";
                  statusText = "Easy";
                }

                return (
                  <div key={item.grade} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-lg gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {item.grade}
                      </div>
                      <div>
                        <p className="font-medium">Target: {item.minPercent}%</p>
                        <p className="text-xs text-muted-foreground">
                          {p.secured 
                            ? "Already hit!" 
                            : p.feasible 
                              ? `Need ${p.neededWeight.toFixed(1)}% more weight` 
                              : "Not enough weight left"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={statusColor}>{statusText}</Badge>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="target-grade" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Target Grade</label>
              <Select value={targetGrade} onValueChange={setTargetGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a grade..." />
                </SelectTrigger>
                <SelectContent>
                  {sortedScale.map(g => (
                    <SelectItem key={g.grade} value={g.grade}>
                      Grade {g.grade} (&gt;= {g.minPercent}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2">
              {targetGradePrediction && renderDistributionBox(targetGradePrediction)}
            </div>
          </TabsContent>

          <TabsContent value="target-marks" className="space-y-4 mt-4">
             <div className="space-y-2">
              <label className="text-sm font-medium">Target Percentage (%)</label>
              <div className="flex gap-2 items-center">
                <Input 
                  type="number" 
                  value={targetPercentStr} 
                  onChange={(e) => setTargetPercentStr(e.target.value)} 
                  min={0} 
                  max={100}
                />
                <span className="text-xl font-bold">%</span>
              </div>
            </div>

            <div className="pt-2">
              {targetMarksPrediction && renderDistributionBox(targetMarksPrediction)}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
