'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CustomTooltip } from './CustomTooltip';

interface CreditWeightedChartProps {
  data: {
    subject: string;
    credits: number;
    percentage: number;
  }[];
}

export function CreditWeightedChart({ data }: CreditWeightedChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Credit vs Performance</CardTitle>
          <CardDescription>Visualizing subject impact</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No data available yet.
        </CardContent>
      </Card>
    );
  }

  // Define bubble sizes based on credits. ZAxis handles the radius.
  // We'll map credits to a reasonable range, e.g., 100 to 1000.
  const minCredits = Math.min(...data.map(d => d.credits));
  const maxCredits = Math.max(...data.map(d => d.credits));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit vs Performance</CardTitle>
        <CardDescription>Size represents credit weight</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis 
                type="category" 
                dataKey="subject" 
                name="Subject" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => value.length > 8 ? value.substring(0, 8) + '...' : value}
              />
              <YAxis 
                type="number" 
                dataKey="percentage" 
                name="Performance" 
                domain={[0, 100]} 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}%`}
              />
              <ZAxis 
                type="number" 
                dataKey="credits" 
                name="Credits" 
                range={[200, 1500]} // Controls the min and max area of the circles
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Scatter 
                name="Subjects" 
                data={data} 
                fill="var(--chart-2)" 
                fillOpacity={0.7}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
