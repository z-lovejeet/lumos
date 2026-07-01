'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimulatorInputs } from './SimulatorInputs';
import { StrategyDisplay } from './StrategyDisplay';

type ComponentScheme = { name: string; maxMarks: number; weight: number; isOptional?: boolean };

export type SubjectPredictionDTO = {
  id: string;
  name: string;
  code: string;
  markingScheme: { components: ComponentScheme[] } | null;
  marks: { componentName: string; obtainedMarks: number | null }[];
};

export type GradeScaleEntry = {
  grade: string;
  minPercent: number;
  point?: number;
};

interface TargetGradeClientProps {
  subjects: SubjectPredictionDTO[];
  gradeScale: GradeScaleEntry[];
}

export function TargetGradeClient({ subjects, gradeScale }: TargetGradeClientProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  
  // This state holds the marks the user is playing around with.
  // Record<componentName, inputtedMark | null>
  const [simulatedMarks, setSimulatedMarks] = useState<Record<string, number | null>>({});

  const selectedSubject = useMemo(() => {
    return subjects.find(s => s.id === selectedSubjectId) || null;
  }, [subjects, selectedSubjectId]);

  const handleSubjectSelect = (val: string) => {
    setSelectedSubjectId(val);
    setSimulatedMarks({});
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
      <Card className="lg:col-span-3 h-fit">
        <CardHeader>
          <CardTitle>Subject Selection</CardTitle>
          <CardDescription>
            Select a subject to start simulating your grades.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Select Subject</label>
            <Select value={selectedSubjectId} onValueChange={handleSubjectSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject...">
                  {selectedSubject ? `${selectedSubject.code} - ${selectedSubject.name}` : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.code} - {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSubject && (
            <SimulatorInputs 
              subject={selectedSubject} 
              simulatedMarks={simulatedMarks}
              setSimulatedMarks={setSimulatedMarks}
            />
          )}
        </CardContent>
      </Card>

      <div className="lg:col-span-4 h-fit">
        {selectedSubject ? (
          <StrategyDisplay 
            subject={selectedSubject}
            simulatedMarks={simulatedMarks}
            gradeScale={gradeScale}
          />
        ) : (
          <Card className="h-[300px] flex items-center justify-center border-dashed">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-lg">No Subject Selected</h3>
              <p className="text-sm text-muted-foreground">Select a subject on the left to view strategies.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
