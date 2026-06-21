import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { GradeRange } from '@/lib/calculations/sgpa';

interface GradeSliderProps {
  subjectName: string;
  subjectCode: string;
  currentPercentage: number;
  gradeScale: GradeRange[];
  onChange: (percentage: number) => void;
}

export function GradeSlider({ subjectName, subjectCode, currentPercentage, gradeScale, onChange }: GradeSliderProps) {
  // Sort grades from lowest to highest percentage
  const sortedScale = [...gradeScale].sort((a, b) => a.minPercentage - b.minPercentage);
  
  // Find current grade based on percentage
  const currentGrade = sortedScale.find((g, i) => 
    currentPercentage >= g.minPercentage && 
    (i === sortedScale.length - 1 || currentPercentage < sortedScale[i + 1].minPercentage)
  ) || sortedScale[0];

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-semibold">{subjectCode}</h4>
          <p className="text-sm text-muted-foreground line-clamp-1">{subjectName}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{currentGrade?.grade || 'N/A'}</div>
          <div className="text-xs text-muted-foreground">{currentPercentage.toFixed(1)}%</div>
        </div>
      </div>
      
      <Slider 
        value={[currentPercentage]} 
        min={0} 
        max={100} 
        step={1}
        onValueChange={(vals) => onChange(vals[0])}
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
