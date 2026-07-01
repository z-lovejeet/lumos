'use client';

import { SubjectPredictionDTO } from './TargetGradeClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DownloadCloud, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SimulatorInputsProps {
  subject: SubjectPredictionDTO;
  simulatedMarks: Record<string, number | null>;
  setSimulatedMarks: React.Dispatch<React.SetStateAction<Record<string, number | null>>>;
}

export function SimulatorInputs({ subject, simulatedMarks, setSimulatedMarks }: SimulatorInputsProps) {
  const components = subject.markingScheme?.components || [];

  const handleImport = () => {
    const newMarks: Record<string, number | null> = {};
    subject.marks.forEach(m => {
      newMarks[m.componentName] = m.obtainedMarks;
    });
    setSimulatedMarks(newMarks);
  };

  const handleReset = () => {
    setSimulatedMarks({});
  };

  const handleChange = (compName: string, value: string, maxMarks: number) => {
    if (value === '') {
      setSimulatedMarks(prev => ({ ...prev, [compName]: null }));
      return;
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // Clamp between 0 and maxMarks natively in state as well?
      // Better to let user type and engine clamp, or clamp here. We clamp here.
      const clamped = Math.max(0, Math.min(numValue, maxMarks));
      setSimulatedMarks(prev => ({ ...prev, [compName]: clamped }));
    }
  };

  const activeInputCount = Object.values(simulatedMarks).filter(v => v !== null && v !== undefined).length;

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Assessments</h3>
          <p className="text-sm text-muted-foreground">Input your expected or known marks.</p>
        </div>
        <div className="flex gap-2">
          {activeInputCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleReset} title="Reset all inputs">
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={handleImport}>
            <DownloadCloud className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {components.map((comp) => {
          const isOptional = comp.isOptional; // Though rarely used in core calculation, good for UI
          const currentVal = simulatedMarks[comp.name];

          return (
            <div key={comp.name} className="flex flex-col space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium flex items-center gap-2">
                  {comp.name}
                  {isOptional && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">Optional</Badge>}
                </label>
                <span className="text-xs text-muted-foreground">Weight: {comp.weight}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Input 
                  type="number"
                  placeholder={`Max: ${comp.maxMarks}`}
                  min={0}
                  max={comp.maxMarks}
                  step="any"
                  value={currentVal !== null && currentVal !== undefined ? currentVal : ''}
                  onChange={(e) => handleChange(comp.name, e.target.value, comp.maxMarks)}
                  className={`w-full ${currentVal !== null && currentVal !== undefined ? 'border-primary ring-1 ring-primary/20' : ''}`}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">/ {comp.maxMarks}</span>
              </div>
            </div>
          );
        })}

        {components.length === 0 && (
          <div className="text-sm text-muted-foreground italic text-center py-4 border rounded-md">
            No marking scheme components found for this subject.
          </div>
        )}
      </div>
    </div>
  );
}
