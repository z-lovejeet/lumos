'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, AlertCircle, BookOpen, ArrowUpRight } from 'lucide-react';
import { StrategyRecommendation } from '@/lib/strategy/strategy-engine';
import { StudyPriority } from '@/lib/strategy/study-priority';
import { RiskAlert } from '@/lib/alerts/risk-detector';

export default function StrategyPage() {
  const [data, setData] = useState<{
    recommendations: StrategyRecommendation[];
    priorities: StudyPriority[];
    risks: RiskAlert[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStrategy() {
      try {
        const res = await fetch('/api/strategy');
        if (res.ok) {
          setData(await res.json());
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchStrategy();
  }, []);

  if (loading) {
    return <div className="p-8">Loading AI Strategy...</div>;
  }

  if (!data || data.priorities.length === 0) {
    return (
      <div className="p-8">
        <PageHeader title="AI Study Strategy" description="ROI-ranked recommendations" />
        <Card className="mt-8">
          <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
            No academic data found to generate strategy. Add subjects and marks first.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="AI Study Strategy" description="Data-driven insights to maximize your SGPA" />

      {/* Risk Alerts */}
      {data.risks.length > 0 && (
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" /> 
            Active Risks
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {data.risks.map(risk => (
              <Card key={risk.id} className={risk.severity === 'critical' ? 'border-destructive bg-destructive/5' : 'border-amber-500/50 bg-amber-500/5'}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex justify-between items-center">
                    {risk.type === 'attendance' ? 'Attendance Risk' : 'Academic Risk'}
                    <Badge variant={risk.severity === 'critical' ? 'destructive' : 'outline'} className={risk.severity === 'warning' ? 'text-amber-500 border-amber-500' : ''}>
                      {risk.severity}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{risk.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Top ROI Recommendations */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Highest ROI Interventions
            </CardTitle>
            <CardDescription>Focusing on these subjects yields the highest SGPA boost</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.recommendations.map((rec, i) => (
              <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge>{rec.type}</Badge>
                    <span className="font-semibold text-lg">{rec.subjectName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.message}</p>
                </div>
                <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="font-semibold">+{rec.sgpaImpact.toFixed(2)} SGPA</span>
                </div>
              </div>
            ))}
            {data.recommendations.length === 0 && (
              <p className="text-muted-foreground text-sm">No specific recommendations at this time.</p>
            )}
          </CardContent>
        </Card>

        {/* Study Priority Ranker */}
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Study Priority Ranker
            </CardTitle>
            <CardDescription>What to study tonight</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.priorities.map(p => (
                <div key={p.subjectId} className="flex items-start gap-4 p-3 rounded-lg border bg-card">
                  <div className="bg-muted w-8 h-8 rounded-full flex items-center justify-center font-bold text-muted-foreground shrink-0">
                    #{p.rank}
                  </div>
                  <div>
                    <p className="font-medium">{p.subjectName}</p>
                    <ul className="mt-1 space-y-1">
                      {p.reasons.map((reason, i) => (
                         <li key={i} className="text-xs text-muted-foreground flex items-center gap-1 before:content-['•'] before:text-primary">
                           {reason}
                         </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
