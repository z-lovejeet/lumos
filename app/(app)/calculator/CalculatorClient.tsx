'use client';

import { useState, useMemo, useEffect } from 'react';
import { GradeRange, calculateSGPA, getGPAValueFromPercentage, getGradeFromPercentage } from '@/lib/calculations/sgpa';
import { calculateCGPA } from '@/lib/calculations/cgpa';
import { calculateSubjectPercentage, CalculationComponent } from '@/lib/calculations/percentage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Calculator, Activity, TrendingUp, Award } from 'lucide-react';
import { saveCGPA, saveSGPA } from '../profile/actions';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CalculatorClientProps {
  semesters: any[];
  gradeScale: any[];
  savedSGPA?: number;
  savedCGPA?: number;
}

export function CalculatorClient({ semesters, gradeScale, savedSGPA, savedCGPA }: CalculatorClientProps) {
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

  // Find active semester (or fallback to latest)
  const activeSemester = semesters.find(s => s.status === 'active') || semesters[semesters.length - 1];

  // Manual overrides mapping: { subjectId: gradeString }
  const [manualSgpaOverrides, setManualSgpaOverrides] = useState<Record<string, string>>({});
  const [manualCgpaOverrides, setManualCgpaOverrides] = useState<Record<string, string>>({});
  
  const [isSavingSgpa, setIsSavingSgpa] = useState(false);
  const [isSavingCgpa, setIsSavingCgpa] = useState(false);
  
  // Displayed values (initially set to saved values, then updated on 'Calculate')
  const [displayedSgpa, setDisplayedSgpa] = useState<number | null>(savedSGPA ?? null);
  const [displayedCgpa, setDisplayedCgpa] = useState<number | null>(savedCGPA ?? null);

  // Compute SGPA logic (for the active semester only)
  const computedActiveSemester = useMemo(() => {
    if (!activeSemester) return null;
    const subjectsForSgpa = activeSemester.subjects.map((sub: any) => {
      if (manualSgpaOverrides[sub.id] !== undefined) {
        const overrideGrade = manualSgpaOverrides[sub.id];
        const overrideGpaValue = scaleRanges.find(g => g.grade === overrideGrade)?.gpaValue || 0;
        return { credits: sub.credits, gpaValue: overrideGpaValue };
      }
      let components: CalculationComponent[] = [];
      if (sub.markingScheme?.components) {
        components = sub.markingScheme.components as CalculationComponent[];
      }
      const pct = calculateSubjectPercentage(sub.marks || [], components);
      return { credits: sub.credits, percentage: pct };
    });

    const sgpa = calculateSGPA(subjectsForSgpa, scaleRanges);
    const totalCredits = activeSemester.subjects.reduce((sum: number, sub: any) => sum + sub.credits, 0);

    return {
      ...activeSemester,
      totalCredits,
      sgpa,
      subjects: activeSemester.subjects
    };
  }, [activeSemester, manualSgpaOverrides, scaleRanges]);

  // Compute ALL semesters for CGPA
  const computedSemestersForCgpa = useMemo(() => {
    return semesters.map(sem => {
      const subjectsForSgpa = sem.subjects.map((sub: any) => {
        if (manualCgpaOverrides[sub.id] !== undefined) {
          const overrideGrade = manualCgpaOverrides[sub.id];
          const overrideGpaValue = scaleRanges.find(g => g.grade === overrideGrade)?.gpaValue || 0;
          return { credits: sub.credits, gpaValue: overrideGpaValue };
        }
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
        subjects: sem.subjects
      };
    });
  }, [semesters, manualCgpaOverrides, scaleRanges]);

  const liveSgpa = computedActiveSemester?.sgpa || 0;
  const liveCgpa = useMemo(() => calculateCGPA(computedSemestersForCgpa), [computedSemestersForCgpa]);

  // If no saved values, auto-set to computed initially
  useEffect(() => {
    if (displayedSgpa === null && computedActiveSemester) {
      setDisplayedSgpa(liveSgpa);
    }
  }, [computedActiveSemester, liveSgpa, displayedSgpa]);

  useEffect(() => {
    if (displayedCgpa === null && computedSemestersForCgpa.length > 0) {
      setDisplayedCgpa(liveCgpa);
    }
  }, [computedSemestersForCgpa, liveCgpa, displayedCgpa]);

  // Handlers for SGPA
  const handleCalculateSgpa = () => {
    setDisplayedSgpa(liveSgpa);
    toast.success('SGPA Calculated!');
  };

  const handleCalculateAndSaveSgpa = async () => {
    setDisplayedSgpa(liveSgpa);
    setIsSavingSgpa(true);
    const result = await saveSGPA(liveSgpa);
    setIsSavingSgpa(false);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('SGPA calculated and saved to profile successfully!');
    }
  };

  // Handlers for CGPA
  const handleCalculateCgpa = () => {
    setDisplayedCgpa(liveCgpa);
    toast.success('CGPA Calculated!');
  };

  const handleCalculateAndSaveCgpa = async () => {
    setDisplayedCgpa(liveCgpa);
    setIsSavingCgpa(true);
    const result = await saveCGPA(liveCgpa);
    setIsSavingCgpa(false);
    
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
    <div className="mt-6">
      <Tabs defaultValue="sgpa" className="space-y-6">
        <TabsList className="bg-muted/50 backdrop-blur-md border border-border/50 p-1 rounded-xl">
          <TabsTrigger value="sgpa" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all px-6">SGPA Calculator</TabsTrigger>
          <TabsTrigger value="cgpa" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all px-6">CGPA Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="sgpa" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-4 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <Card className="bg-blue-500/5 border-blue-500/20 text-center md:text-left">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center justify-center md:justify-start gap-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      Current SGPA
                    </CardTitle>
                    <CardDescription>
                      {displayedSgpa === savedSGPA ? 'Saved to Profile' : 'Calculated'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold">{displayedSgpa?.toFixed(2) || '0.00'}</div>
                  </CardContent>
                </Card>
                <Card className="bg-emerald-500/5 border-emerald-500/20 text-center md:text-left">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center justify-center md:justify-start gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      Predicted SGPA
                    </CardTitle>
                    <CardDescription>Based on live inputs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{liveSgpa.toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col gap-3">
                <Button className="w-full" variant="default" onClick={handleCalculateSgpa}>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate SGPA
                </Button>
                <Button className="w-full" variant="outline" onClick={handleCalculateAndSaveSgpa} disabled={isSavingSgpa}>
                  {isSavingSgpa ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Calculate & Save SGPA
                </Button>
              </div>
            </div>
            
            <div className="md:col-span-8">
              {computedActiveSemester && (
                <Card className="overflow-hidden">
                  <CardHeader className="text-center md:text-left flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                    <div>
                      <CardTitle>{computedActiveSemester.name} Subject Breakdown</CardTitle>
                      <CardDescription>Active semester. Auto-calculated from marks. Use dropdowns for manual overrides.</CardDescription>
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
                        {computedActiveSemester.subjects.map((subject: any) => {
                          let components: CalculationComponent[] = [];
                          if (subject.markingScheme?.components) {
                            components = subject.markingScheme.components as CalculationComponent[];
                          }
                          const pct = calculateSubjectPercentage(subject.marks || [], components);
                          const autoGrade = getGradeFromPercentage(pct, scaleRanges);
                          const isOverridden = manualSgpaOverrides[subject.id] !== undefined;

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
                                  value={isOverridden ? manualSgpaOverrides[subject.id] : "auto"}
                                  onValueChange={(val) => {
                                    if (!val) return;
                                    if (val === "auto") {
                                      const newOverrides = { ...manualSgpaOverrides };
                                      delete newOverrides[subject.id];
                                      setManualSgpaOverrides(newOverrides);
                                    } else {
                                      setManualSgpaOverrides({ ...manualSgpaOverrides, [subject.id]: val });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Auto" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="auto">Auto ({autoGrade})</SelectItem>
                                    {scaleRanges.map(g => (
                                      <SelectItem key={g.grade} value={g.grade}>{g.grade}</SelectItem>
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
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cgpa" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-4 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <Card className="bg-violet-500/5 border-violet-500/20 text-center md:text-left">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center justify-center md:justify-start gap-2">
                      <Award className="h-5 w-5 text-violet-500" />
                      Current CGPA
                    </CardTitle>
                    <CardDescription>
                      {displayedCgpa === savedCGPA ? 'Saved to Profile' : 'Calculated'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold">{displayedCgpa?.toFixed(2) || '0.00'}</div>
                  </CardContent>
                </Card>
                <Card className="bg-emerald-500/5 border-emerald-500/20 text-center md:text-left">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center justify-center md:justify-start gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      Predicted CGPA
                    </CardTitle>
                    <CardDescription>Based on live inputs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{liveCgpa.toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col gap-3">
                <Button className="w-full" variant="default" onClick={handleCalculateCgpa}>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate CGPA
                </Button>
                <Button className="w-full" variant="outline" onClick={handleCalculateAndSaveCgpa} disabled={isSavingCgpa}>
                  {isSavingCgpa ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Calculate & Save CGPA
                </Button>
              </div>
            </div>
            
            <div className="md:col-span-8 space-y-6">
              {computedSemestersForCgpa.map((computedSem) => (
                <Card key={computedSem.id} className="overflow-hidden">
                  <CardHeader className="text-center md:text-left flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                    <div>
                      <CardTitle>{computedSem.name}</CardTitle>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">SGPA: {computedSem.sgpa.toFixed(2)}</div>
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
                          const isOverridden = manualCgpaOverrides[subject.id] !== undefined;

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
                                  value={isOverridden ? manualCgpaOverrides[subject.id] : "auto"}
                                  onValueChange={(val) => {
                                    if (!val) return;
                                    if (val === "auto") {
                                      const newOverrides = { ...manualCgpaOverrides };
                                      delete newOverrides[subject.id];
                                      setManualCgpaOverrides(newOverrides);
                                    } else {
                                      setManualCgpaOverrides({ ...manualCgpaOverrides, [subject.id]: val });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Auto" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="auto">Auto ({autoGrade})</SelectItem>
                                    {scaleRanges.map(g => (
                                      <SelectItem key={g.grade} value={g.grade}>{g.grade}</SelectItem>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
