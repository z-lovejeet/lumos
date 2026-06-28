'use client';

import { useState, useMemo } from 'react';
import { GradeRange, calculateSGPA, getGPAValueFromPercentage, getGradeFromPercentage } from '@/lib/calculations/sgpa';
import { calculateCGPA } from '@/lib/calculations/cgpa';
import { calculateSubjectPercentage, CalculationComponent } from '@/lib/calculations/percentage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CalculatorClientProps {
  semesters: any[];
  gradeScale: any[];
}

export function CalculatorClient({ semesters, gradeScale }: CalculatorClientProps) {
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

  // Active semester is either the one marked active, or the last one
  const activeSemester = semesters.find(s => s.status === 'active') || semesters[semesters.length - 1];

  // Manual overrides mapping: { subjectId: gpaValue }
  const [manualOverrides, setManualOverrides] = useState<Record<string, number>>({});

  // Compute SGPA for ALL semesters for CGPA calculation
  const computedSemesters = useMemo(() => {
    return semesters.map(sem => {
      const subjectsForSgpa = sem.subjects.map((sub: any) => {
        // If this is the active semester and we have a manual override
        if (sem.id === activeSemester?.id && manualOverrides[sub.id] !== undefined) {
          return { credits: sub.credits, gpaValue: manualOverrides[sub.id] };
        }

        // Otherwise auto-calculate from marks
        let components: CalculationComponent[] = [];
        if (sub.markingScheme?.components) {
          components = sub.markingScheme.components as CalculationComponent[];
        }
        const pct = calculateSubjectPercentage(sub.marks || [], components);
        return { credits: sub.credits, percentage: pct };
      });

      const sgpa = calculateSGPA(subjectsForSgpa, scaleRanges);
      const totalCredits = sem.subjects.reduce((sum: number, sub: any) => sum + sub.credits, 0);

      return {
        id: sem.id,
        name: sem.name,
        totalCredits,
        sgpa,
        subjects: sem.subjects // pass down for rendering
      };
    });
  }, [semesters, manualOverrides, scaleRanges, activeSemester]);

  const cgpa = useMemo(() => {
    return calculateCGPA(computedSemesters);
  }, [computedSemesters]);

  const currentComputedSemester = computedSemesters.find(s => s.id === activeSemester?.id);

  if (!activeSemester) {
    return (
      <div className="mt-8 border rounded-lg p-12 text-center text-muted-foreground">
        No semesters found. Add a semester and subjects to use the calculator.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-12 mt-6 max-w-[90%] md:max-w-none mx-auto">
      <div className="md:col-span-4 space-y-6">
        <Card className="bg-primary/5 border-primary/20 text-center md:text-left">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Cumulative GPA</CardTitle>
            <CardDescription>Across {computedSemesters.length} semesters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl md:text-6xl font-bold">{cgpa.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="text-center md:text-left">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground">Current SGPA</CardTitle>
            <CardDescription>{activeSemester.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl md:text-6xl font-bold">{currentComputedSemester?.sgpa.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-8 overflow-hidden">
        <Card className="overflow-hidden">
          <CardHeader className="text-center md:text-left">
            <CardTitle>Subject Breakdown</CardTitle>
            <CardDescription>
              Auto-calculated from your marks. Use the dropdowns to test manual overrides.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead className="w-[100px]">Credits</TableHead>
                  <TableHead>Auto Grade</TableHead>
                  <TableHead className="w-[150px]">Manual Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSemester.subjects.map((subject: any) => {
                  let components: CalculationComponent[] = [];
                  if (subject.markingScheme?.components) {
                    components = subject.markingScheme.components as CalculationComponent[];
                  }
                  const pct = calculateSubjectPercentage(subject.marks || [], components);
                  const autoGrade = getGradeFromPercentage(pct, scaleRanges);
                  const autoPoint = getGPAValueFromPercentage(pct, scaleRanges);
                  
                  const isOverridden = manualOverrides[subject.id] !== undefined;

                  return (
                    <TableRow key={subject.id} className={isOverridden ? "bg-muted/50" : ""}>
                      <TableCell className="font-medium">
                        <div>{subject.code}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{subject.name}</div>
                      </TableCell>
                      <TableCell>{subject.credits}</TableCell>
                      <TableCell>
                        <div className="font-semibold">{autoGrade}</div>
                        <div className="text-xs text-muted-foreground">({pct.toFixed(1)}%)</div>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={isOverridden ? manualOverrides[subject.id].toString() : "auto"}
                          onValueChange={(val) => {
                            if (!val) return;
                            if (val === "auto") {
                              const newOverrides = { ...manualOverrides };
                              delete newOverrides[subject.id];
                              setManualOverrides(newOverrides);
                            } else {
                              setManualOverrides({ ...manualOverrides, [subject.id]: parseFloat(val) });
                            }
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Auto" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto ({autoGrade})</SelectItem>
                            {scaleRanges.map(g => (
                              <SelectItem key={g.grade} value={g.gpaValue.toString()}>
                                {g.grade} ({g.gpaValue})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
