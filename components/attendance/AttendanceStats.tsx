import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AttendanceStatsProps {
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
}

export function AttendanceStats({ totalClasses, attendedClasses, percentage }: AttendanceStatsProps) {
  const colorClass = percentage >= 75 ? "bg-emerald-500" : "bg-destructive";
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Overall Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-2">
          {percentage.toFixed(1)}%
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full ${colorClass} transition-all`} 
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }} 
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Attended {attendedClasses} out of {totalClasses} classes
        </p>
      </CardContent>
    </Card>
  );
}
