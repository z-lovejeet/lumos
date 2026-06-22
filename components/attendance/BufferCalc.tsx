import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface BufferCalcProps {
  canMiss: number;
  needToAttend: number;
  status: 'safe' | 'danger' | 'critical';
}

export function BufferCalc({ canMiss, needToAttend, status }: BufferCalcProps) {
  let icon = <CheckCircle className="h-5 w-5 text-emerald-500" />;
  let color = "text-emerald-500";
  let bg = "bg-emerald-500/10";
  
  if (status === 'danger') {
    icon = <AlertTriangle className="h-5 w-5 text-amber-500" />;
    color = "text-amber-500";
    bg = "bg-amber-500/10";
  } else if (status === 'critical') {
    icon = <ShieldAlert className="h-5 w-5 text-destructive" />;
    color = "text-destructive";
    bg = "bg-destructive/10";
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          <span>Attendance Buffer</span>
          {icon}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-1">
          {status === 'critical' ? (
            <>
              <span className="text-2xl font-bold text-destructive">
                Must attend {needToAttend}
              </span>
              <span className="text-xs text-muted-foreground">
                consecutive classes to reach 75%
              </span>
            </>
          ) : (
            <>
              <span className={`text-2xl font-bold ${color}`}>
                Can miss {canMiss}
              </span>
              <span className="text-xs text-muted-foreground">
                more classes and stay above 75%
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
