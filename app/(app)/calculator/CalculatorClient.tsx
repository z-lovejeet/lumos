'use client';

import { useState, useMemo, useEffect } from 'react';
import { GradeRange, calculateSGPA, getGPAValueFromPercentage, getGradeFromPercentage } from '@/lib/calculations/sgpa';
import { calculateCGPA } from '@/lib/calculations/cgpa';
import { calculateSubjectPercentage, CalculationComponent } from '@/lib/calculations/percentage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Calculator } from 'lucide-react';
import { saveCGPA } from '../profile/actions';
import { toast } from 'sonner';

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

  // Manual overrides mapping: { subjectId: gradeString }
  const [manualOverrides, setManualOverrides] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // State for the displayed (calculated) values
  const [displayedCgpa, setDisplayedCgpa] = useState<number | null>(null);

  // Compute SGPA for ALL semesters for CGPA calculation
  const computedSemesters = useMemo(() => {
    return semesters.map(sem => {
      const subjectsForSgpa = sem.subjects.map((sub: any) => {
        // If we have a manual override for this subject
        if (manualOverrides[sub.id] !== undefined) {
          const overrideGrade = manualOverrides[sub.id];
          const overrideGpaValue = scaleRanges.find(g => g.grade === overrideGrade)?.gpaValue || 0;
          return { credits: sub.credits, gpaValue: overrideGpaValue };
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
  }, [semesters, manualOverrides, scaleRanges]);

  const liveCgpa = useMemo(() => {
    return calculateCGPA(computedSemesters);
  }, [computedSemesters]);

  // Set initial display to the auto-calculated values
  useEffect(() => {
    if (displayedCgpa === null && computedSemesters.length > 0) {
      setDisplayedCgpa(liveCgpa);
    }
  }, [computedSemesters, liveCgpa, displayedCgpa]);

  const handleCalculate = () => {
    setDisplayedCgpa(liveCgpa);
    toast.success('GPA Calculated!');
  };

  const handleCalculateAndSave = async () => {
    setDisplayedCgpa(liveCgpa);
    setIsSaving(true);
    const result = await saveCGPA(liveCgpa);
    setIsSaving(false);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('CGPA calculated and saved to profile successfully!');
    }
  };

  if (semesters.length === 0) {
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
            <div className="text-5xl md:text-6xl font-bold">{displayedCgpa?.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button 
            className="w-full" 
            variant="default" 
            onClick={handleCalculate}
          >
            <Calculator className="mr-2 h-4 w-4" />
            Calculate GPA
          </Button>

          <Button 
            className="w-full" 
            variant="outline" 
            onClick={handleCalculateAndSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Calculate & Save CGPA
          </Button>
        </div>
      </div>
      
      <div className="md:col-span-8 space-y-6">
        {computedSemesters.map((computedSem) => (
          <Card key={computedSem.id} className="overflow-hidden">
            <CardHeader className="text-center md:text-left flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
              <div>
                <CardTitle>{computedSem.name} Subject Breakdown</CardTitle>
                <CardDescription>
                  Auto-calculated from marks. Use dropdowns for manual overrides.
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg">SGPA: {computedSem.sgpa.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Credits: {computedSem.totalCredits}</div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="w-[80px]">Credits</TableHead>
                    <TableHead>Auto Grade</TableHead>
                    <TableHead className="w-[140px]">Manual Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {computedSem.subjects.map((subject: any) => {
                    let components: CalculationComponent[] = [];
                    if (subject.markingScheme?.components) {
                      components = subject.markingScheme.components as CalculationComponent[];
                    }
                    const pct = calculateSubjectPercentage(subject.marks || [], components);
                    const autoGrade = getGradeFromPercentage(pct, scaleRanges);
                    
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
                            value={isOverridden ? manualOverrides[subject.id] : "auto"}
                            onValueChange={(val) => {
                              if (!val) return;
                              if (val === "auto") {
                                const newOverrides = { ...manualOverrides };
                                delete newOverrides[subject.id];
                                setManualOverrides(newOverrides);
                              } else {
                                setManualOverrides({ ...manualOverrides, [subject.id]: val });
                              }
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Auto" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto">Auto ({autoGrade})</SelectItem>
                              {scaleRanges.map(g => (
                                <SelectItem key={g.grade} value={g.grade}>
                                  {g.grade}
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
        ))}
      </div>
    </div>
  );
}
