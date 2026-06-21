import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SimulatedSGPACardProps {
  originalSgpa: number;
  simulatedSgpa: number;
}

export function SimulatedSGPACard({ originalSgpa, simulatedSgpa }: SimulatedSGPACardProps) {
  const diff = simulatedSgpa - originalSgpa;
  const isPositive = diff > 0;
  const isNegative = diff < 0;
  const isNeutral = diff === 0;

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-muted-foreground">Simulated SGPA</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4">
          <div className="text-5xl font-bold">{simulatedSgpa.toFixed(2)}</div>
          
          <div className="flex items-center gap-2 mb-1">
            <span className="text-muted-foreground line-through opacity-70 text-lg">
              {originalSgpa.toFixed(2)}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            
            {isPositive && (
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +{diff.toFixed(2)}
              </span>
            )}
            
            {isNegative && (
              <span className="flex items-center text-destructive font-medium">
                <ArrowDownRight className="h-4 w-4 mr-1" />
                {diff.toFixed(2)}
              </span>
            )}

            {isNeutral && (
              <span className="text-muted-foreground font-medium">
                No change
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
