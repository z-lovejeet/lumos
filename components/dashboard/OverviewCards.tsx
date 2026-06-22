import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, CalendarDays, BookOpen, AlertCircle, Award, Briefcase, Activity, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DashboardMetrics {
  currentSgpa: number;
  predictedSgpa: number;
  cgpa: number;
  creditsCompleted: number;
  attendancePercentage: number;
  upcomingExamsCount: number;
  pendingAssignmentsCount: number;
  weakestSubject: string;
  strongestSubject: string;
}

export function OverviewCards({ metrics }: { metrics: DashboardMetrics }) {
  const cards = [
    {
      title: 'Current SGPA',
      value: metrics.currentSgpa.toFixed(2),
      description: 'Calculated from entered marks',
      icon: Activity,
      color: 'text-blue-500'
    },
    {
      title: 'Predicted SGPA',
      value: metrics.predictedSgpa.toFixed(2),
      description: 'Based on current performance trajectory',
      icon: TrendingUp,
      color: metrics.predictedSgpa >= metrics.currentSgpa ? 'text-emerald-500' : 'text-amber-500'
    },
    {
      title: 'CGPA',
      value: metrics.cgpa.toFixed(2),
      description: 'Cumulative across all semesters',
      icon: Award,
      color: 'text-violet-500'
    },
    {
      title: 'Credits Completed',
      value: metrics.creditsCompleted,
      description: 'Total earned credits',
      icon: Target,
      color: 'text-cyan-500'
    },
    {
      title: 'Attendance',
      value: `${metrics.attendancePercentage.toFixed(1)}%`,
      description: 'Overall attendance rate',
      icon: CalendarDays,
      color: metrics.attendancePercentage < 75 ? 'text-destructive' : 'text-emerald-500'
    },
    {
      title: 'Upcoming Exams',
      value: metrics.upcomingExamsCount,
      description: 'Scheduled in the next 30 days',
      icon: CalendarClock,
      color: 'text-amber-500'
    },
    {
      title: 'Pending Assignments',
      value: metrics.pendingAssignmentsCount,
      description: 'To be submitted soon',
      icon: Briefcase,
      color: 'text-amber-500'
    },
    {
      title: 'Strongest Subject',
      value: metrics.strongestSubject || 'N/A',
      description: 'Highest predicted grade',
      icon: BookOpen,
      color: 'text-emerald-500'
    },
    {
      title: 'Weakest Subject',
      value: metrics.weakestSubject || 'N/A',
      description: 'Requires more attention',
      icon: AlertCircle,
      color: 'text-destructive'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {cards.map((card, idx) => (
        <Card key={idx} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={cn("h-4 w-4", card.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
