import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, CalendarDays, BookOpen, AlertCircle, Award, Briefcase, Activity, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StaggerContainer } from '@/components/motion/StaggerContainer';
import { AnimatedCard } from '@/components/motion/AnimatedCard';
import { NumberCounter } from '@/components/motion/NumberCounter';

export interface DashboardMetrics {
  currentSgpa: number;
  predictedSgpa: number;
  cgpa: number;
  creditsCompleted: number;
  attendancePercentage: number;
  weakestSubject: string;
  strongestSubject: string;
}

export function OverviewCards({ metrics }: { metrics: DashboardMetrics }) {
  const cards = [
    {
      title: 'Current SGPA',
      value: metrics.currentSgpa,
      isNumber: true,
      decimals: 2,
      description: 'Calculated from entered marks',
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20'
    },
    {
      title: 'Predicted SGPA',
      value: metrics.predictedSgpa,
      isNumber: true,
      decimals: 2,
      description: 'Based on current performance trajectory',
      icon: TrendingUp,
      color: metrics.predictedSgpa >= metrics.currentSgpa ? 'text-emerald-500' : 'text-amber-500',
      bgColor: metrics.predictedSgpa >= metrics.currentSgpa ? 'bg-emerald-500/10 dark:bg-emerald-500/20' : 'bg-amber-500/10 dark:bg-amber-500/20'
    },
    {
      title: 'CGPA',
      value: metrics.cgpa,
      isNumber: true,
      decimals: 2,
      description: 'Cumulative across all semesters',
      icon: Award,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10 dark:bg-violet-500/20'
    },
    {
      title: 'Credits Completed',
      value: metrics.creditsCompleted,
      isNumber: true,
      description: 'Total earned credits',
      icon: Target,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10 dark:bg-cyan-500/20'
    },
    {
      title: 'Attendance',
      value: metrics.attendancePercentage,
      isNumber: true,
      decimals: 1,
      suffix: '%',
      description: 'Overall attendance rate',
      icon: CalendarDays,
      color: metrics.attendancePercentage < 75 ? 'text-destructive' : 'text-emerald-500',
      bgColor: metrics.attendancePercentage < 75 ? 'bg-destructive/10 dark:bg-destructive/20' : 'bg-emerald-500/10 dark:bg-emerald-500/20'
    },
    {
      title: 'Strongest Subject',
      value: metrics.strongestSubject || 'N/A',
      isString: true,
      description: 'Highest predicted grade',
      icon: BookOpen,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20'
    },
    {
      title: 'Weakest Subject',
      value: metrics.weakestSubject || 'N/A',
      isString: true,
      description: 'Requires more attention',
      icon: AlertCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10 dark:bg-destructive/20'
    }
  ];

  return (
    <StaggerContainer className="flex flex-wrap justify-center gap-6">
      {cards.map((card, idx) => (
        <AnimatedCard key={idx} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] 2xl:w-[calc(20%-19.2px)] h-full">
          <Card className="relative overflow-hidden h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-20">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={cn("p-2.5 rounded-xl transition-colors", card.bgColor)}>
                <card.icon className={cn("h-4 w-4", card.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.isNumber ? (
                  <NumberCounter value={card.value as number} decimals={card.decimals} suffix={card.suffix} />
                ) : (
                  card.value
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        </AnimatedCard>
      ))}
    </StaggerContainer>
  );
}
