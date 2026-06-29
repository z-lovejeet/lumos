"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { CustomTooltip } from "./CustomTooltip"

interface SubjectAttendanceChartProps {
  data: {
    subject: string
    percentage: number
    attended: number
    conducted: number
  }[]
}

export function SubjectAttendanceChart({ data }: SubjectAttendanceChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <Card className="bg-card/95 backdrop-blur-xl border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
      <CardHeader>
        <CardTitle>Subject Attendance</CardTitle>
        <CardDescription>Current attendance percentage across all subjects</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="subject" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
              <ReferenceLine y={75} stroke="currentColor" strokeDasharray="3 3" className="text-destructive/50" />
              <Bar dataKey="percentage" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.percentage >= 75 ? 'var(--primary)' : 'var(--destructive)'} 
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
