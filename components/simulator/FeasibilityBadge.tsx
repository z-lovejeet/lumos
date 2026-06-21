import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface FeasibilityBadgeProps {
  isFeasible: boolean;
  requiredScoreFraction?: number; // 0 to 1+
}

export function FeasibilityBadge({ isFeasible, requiredScoreFraction }: FeasibilityBadgeProps) {
  if (!isFeasible) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        <span>Not Feasible</span>
      </Badge>
    );
  }

  // If feasible, check how hard it is
  if (requiredScoreFraction !== undefined) {
    if (requiredScoreFraction > 0.9) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300">
          <AlertCircle className="h-3 w-3" />
          <span>Very Hard ({(requiredScoreFraction * 100).toFixed(0)}%)</span>
        </Badge>
      );
    } else if (requiredScoreFraction > 0.75) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
          <AlertCircle className="h-3 w-3" />
          <span>Challenging ({(requiredScoreFraction * 100).toFixed(0)}%)</span>
        </Badge>
      );
    }
  }

  return (
    <Badge variant="default" className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600">
      <CheckCircle2 className="h-3 w-3" />
      <span>Feasible</span>
    </Badge>
  );
}
