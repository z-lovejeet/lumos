'use client';

import { useState, useMemo } from 'react';
import { GradeRange, calculateSGPA } from '@/lib/calculations/sgpa';
import { calculateSubjectPercentage, CalculationComponent, CalculationMark } from '@/lib/calculations/percentage';
import { GradeSlider } from '@/components/simulator/GradeSlider';
import { SimulatedSGPACard } from '@/components/simulator/SimulatedSGPACard';

interface SimulatorClientProps {
  subjects: any[];
  gradeScale: any[];
}

export function SimulatorClient({ subjects, gradeScale }: SimulatorClientProps) {
  // Parse grade scale
  const scaleRanges: GradeRange[] = gradeScale.map((g) => ({
    grade: g.grade,
    minPercentage: g.minPercent,
    maxPercentage: 100, // Roughly
    gpaValue: g.point
  }));
  // Fix maxPercentage
  scaleRanges.sort((a, b) => b.minPercentage - a.minPercentage);
  for (let i = 1; i < scaleRanges.length; i++) {
    scaleRanges[i].maxPercentage = scaleRanges[i - 1].minPercentage - 0.01;
  }
  scaleRanges[0].maxPercentage = 100;

  // Initial percentages
  const initialPercentages: Record<string, number> = {};
  subjects.forEach(sub => {
    let components: CalculationComponent[] = [];
    if (sub.markingScheme?.components) {
      components = sub.markingScheme.components as CalculationComponent[];
    }
    const pct = calculateSubjectPercentage(sub.marks || [], components);
    initialPercentages[sub.id] = pct;
  });

  const [simulatedPercentages, setSimulatedPercentages] = useState<Record<string, number>>(initialPercentages);

  const originalSgpa = useMemo(() => {
    const input = subjects.map(s => ({
      credits: s.credits,
      percentage: initialPercentages[s.id]
    }));
    return calculateSGPA(input, scaleRanges);
  }, [subjects, initialPercentages, scaleRanges]);

  const simulatedSgpa = useMemo(() => {
    const input = subjects.map(s => ({
      credits: s.credits,
      percentage: simulatedPercentages[s.id]
    }));
    return calculateSGPA(input, scaleRanges);
  }, [subjects, simulatedPercentages, scaleRanges]);

  if (subjects.length === 0) {
    return (
      <div className="mt-8 border rounded-lg p-12 text-center text-muted-foreground">
        No subjects found in the active semester. Add subjects to simulate SGPA.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-12 mt-6">
      <div className="md:col-span-8 space-y-4">
        {subjects.map(subject => (
          <GradeSlider
            key={subject.id}
            subjectCode={subject.code}
            subjectName={subject.name}
            currentPercentage={simulatedPercentages[subject.id]}
            gradeScale={scaleRanges}
            onChange={(val) => setSimulatedPercentages(prev => ({ ...prev, [subject.id]: val }))}
          />
        ))}
      </div>
      
      <div className="md:col-span-4 space-y-6">
        <div className="sticky top-24">
          <SimulatedSGPACard 
            originalSgpa={originalSgpa} 
            simulatedSgpa={simulatedSgpa} 
          />
        </div>
      </div>
    </div>
  );
}
