"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { MSReadinessScore } from "@/types/career";

interface ReadinessRadarProps {
  score: MSReadinessScore;
}

export function ReadinessRadar({ score }: ReadinessRadarProps) {
  const data = [
    { subject: 'Academics (CGPA)', A: score.academics, fullMark: 100 },
    { subject: 'Test Scores', A: score.testScores, fullMark: 100 },
    { subject: 'Experience', A: score.experience, fullMark: 100 },
    { subject: 'Applications', A: score.applications || 0, fullMark: 100 },
    { subject: 'Profile Fit', A: score.overall, fullMark: 100 },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid className="stroke-muted" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: "var(--foreground)", fontSize: 12 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '8px', 
              border: '1px solid hsl(var(--border))', 
              backgroundColor: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))'
            }}
          />
          <Radar
            name="Readiness"
            dataKey="A"
            stroke="var(--chart-1)"
            fill="var(--chart-1)"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
