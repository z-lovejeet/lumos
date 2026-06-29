'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CustomTooltip } from './CustomTooltip';

interface SGPATrendChartProps {
  data: {
    semester: string;
    sgpa: number;
  }[];
  prediction?: number | null;
}

export function SGPATrendChart({ data, prediction }: SGPATrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SGPA Trend</CardTitle>
          <CardDescription>Semester over semester performance</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No data available yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>SGPA Trend</CardTitle>
          <CardDescription>Semester over semester performance</CardDescription>
        </div>
        {prediction !== undefined && prediction !== null && (
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            Next Sem Prediction: {prediction.toFixed(2)}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSgpa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
              <XAxis 
                dataKey="semester" 
                stroke="var(--muted-foreground)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickMargin={10}
              />
              <YAxis 
                stroke="var(--muted-foreground)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                domain={[0, 10]} 
                tickFormatter={(value) => value.toFixed(1)}
                tickMargin={10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="sgpa" 
                stroke="var(--chart-3)" 
                strokeWidth={3} 
                fillOpacity={1}
                fill="url(#colorSgpa)"
                activeDot={{ r: 6, fill: "var(--background)", stroke: "var(--chart-3)", strokeWidth: 2 }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
