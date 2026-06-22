import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HealthAnalysis } from '@/lib/analysis/semester-health';

export function RiskAlerts({ health }: { health: HealthAnalysis }) {
  if (!health) return null;

  const { status, riskFactors, recommendations, insights } = health;

  let statusColor = '';
  let StatusIcon = Info;

  switch (status) {
    case 'Excellent':
      statusColor = 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
      StatusIcon = CheckCircle2;
      break;
    case 'Good':
      statusColor = 'text-blue-500 border-blue-500/20 bg-blue-500/5';
      StatusIcon = Info;
      break;
    case 'Warning':
      statusColor = 'text-amber-500 border-amber-500/20 bg-amber-500/5';
      StatusIcon = AlertTriangle;
      break;
    case 'Critical':
      statusColor = 'text-destructive border-destructive/20 bg-destructive/5';
      StatusIcon = XCircle;
      break;
  }

  return (
    <Card className={cn("border-2", statusColor)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <StatusIcon className="h-5 w-5" />
          Semester Health: {status}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {riskFactors.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 text-destructive">Risk Factors</h4>
            <ul className="space-y-1">
              {riskFactors.map((risk, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-destructive mt-0.5">•</span>
                  <span className="text-foreground">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 text-amber-500 dark:text-amber-400">Recommendations</h4>
            <ul className="space-y-1">
              {recommendations.map((rec, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span className="text-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {insights.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2 text-blue-500 dark:text-blue-400">Insights</h4>
            <ul className="space-y-1">
              {insights.map((insight, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span className="text-foreground">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
