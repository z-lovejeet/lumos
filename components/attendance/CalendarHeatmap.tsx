'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface AttendanceRecord {
  id: string;
  classDate: string; // ISO
  attended: boolean;
  classType: string;
  subjectName?: string;
}

interface CalendarHeatmapProps {
  data: AttendanceRecord[];
  onDateClick?: (date: Date) => void;
}

export function CalendarHeatmap({ data, onDateClick }: CalendarHeatmapProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  // We want to show complete weeks, so we pad the start and end
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getDayStatus = (day: Date) => {
    // Find records for this day
    const recordsForDay = data.filter(d => isSameDay(parseISO(d.classDate), day));
    if (recordsForDay.length === 0) return 'none';
    
    // If attended at least one class that day, consider it 'attended' (or we can calculate mixed)
    // For simplicity, if any class was missed, we might show mixed, but let's do:
    // All attended = 'attended', any missed = 'missed'
    const missedAny = recordsForDay.some(r => !r.attended);
    return missedAny ? 'missed' : 'attended';
  };

  const getDayRecords = (day: Date) => {
    return data.filter(d => isSameDay(parseISO(d.classDate), day));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Attendance Calendar</CardTitle>
          <CardDescription>Daily view of your classes</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-32 text-center">
            {format(currentDate, dateFormat)}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-xs font-medium text-muted-foreground">{d}</div>
          ))}
        </div>
        
        <TooltipProvider>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const status = getDayStatus(day);
              const records = getDayRecords(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              
              return (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div 
                      onClick={() => onDateClick && onDateClick(day)}
                      className={cn(
                        "aspect-square rounded-md flex items-center justify-center text-sm cursor-pointer transition-colors border border-transparent",
                        !isCurrentMonth && "opacity-30",
                        status === 'none' && "bg-muted/50 hover:border-border",
                        status === 'attended' && "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-500/30",
                        status === 'missed' && "bg-destructive/20 text-destructive font-medium hover:bg-destructive/30"
                      )}
                    >
                      {format(day, 'd')}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-semibold">{format(day, 'MMM d, yyyy')}</p>
                      {records.length > 0 ? (
                        records.map(r => (
                          <div key={r.id} className="text-xs flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full", r.attended ? "bg-emerald-500" : "bg-destructive")} />
                            {r.subjectName || 'Class'} ({r.classType})
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">No classes recorded</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-muted/50" /> No classes
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/50" /> Attended
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-destructive/20 border border-destructive/50" /> Missed
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
