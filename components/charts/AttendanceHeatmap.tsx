'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface AttendanceHeatmapProps {
  data: {
    date: string; // YYYY-MM-DD
    status: 'attended' | 'missed' | 'none';
    subjectName?: string;
  }[];
}

export function AttendanceHeatmap({ data }: AttendanceHeatmapProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance Heatmap</CardTitle>
          <CardDescription>Daily class activity</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground">
          No attendance data logged yet.
        </CardContent>
      </Card>
    );
  }

  // A real implementation would map this strictly to a calendar matrix (weeks x days).
  // For simplicity in this visualization, we display the last 30 days of data in a responsive flex-wrap or grid.
  const getBackgroundColor = (status: string) => {
    switch(status) {
      case 'attended': return 'bg-emerald-500';
      case 'missed': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Heatmap</CardTitle>
        <CardDescription>Daily class activity</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex flex-wrap gap-1 md:gap-1.5">
            {data.map((day, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "w-4 h-4 md:w-5 md:h-5 rounded-sm cursor-pointer transition-transform hover:scale-110",
                      getBackgroundColor(day.status)
                    )} 
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{format(parseISO(day.date), 'MMM d, yyyy')}</p>
                  <p className="text-xs text-muted-foreground capitalize">{day.status} {day.subjectName ? `- ${day.subjectName}` : ''}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
        
        <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-muted" /> None
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" /> Attended
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-destructive" /> Missed
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
