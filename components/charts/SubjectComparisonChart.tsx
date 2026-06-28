'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SubjectComparisonChartProps {
  data: {
    subject: string;
    percentage: number;
    classAverage?: number;
  }[];
}

export function SubjectComparisonChart({ data }: SubjectComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance</CardTitle>
          <CardDescription>Comparison across current subjects</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No data available yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Performance</CardTitle>
        <CardDescription>Percentage comparison across current subjects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
              <XAxis 
                dataKey="subject" 
                stroke="var(--muted-foreground)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickMargin={10}
                tickFormatter={(value) => value.length > 10 ? value.substring(0, 10) + '...' : value}
              />
              <YAxis 
                stroke="var(--muted-foreground)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tickMargin={10}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid var(--border)', 
                  backgroundColor: 'oklch(var(--background) / 0.8)',
                  backdropFilter: 'blur(8px)'
                }}
                itemStyle={{ color: 'var(--foreground)', fontWeight: 500 }}
                cursor={{ fill: 'var(--chart-4)', opacity: 0.1 }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar 
                name="Your Score"
                dataKey="percentage" 
                fill="var(--chart-1)" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={50}
              />
              {data.some(d => d.classAverage !== undefined) && (
                <Bar 
                  name="Class Average"
                  dataKey="classAverage" 
                  fill="var(--chart-4)" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={50}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
