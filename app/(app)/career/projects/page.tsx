"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProjectsPage() {
  const allProjects = [
    {
      title: "AI Academic Tracker",
      description: "Build a full-stack Next.js application using React, TypeScript, and Supabase.",
      tags: ["Web Dev", "AI", "Database"],
      basedOn: ["Web", "DBMS", "Database", "AI", "Artificial Intelligence"]
    },
    {
      title: "Microservices Deployment Pipeline",
      description: "Create a scalable CI/CD pipeline using Docker and Kubernetes.",
      tags: ["DevOps", "Cloud", "Architecture"],
      basedOn: ["Cloud", "Networks", "Distributed"]
    },
    {
      title: "Stock Price Prediction Engine",
      description: "Use Linear Regression and LSTM to predict future stock prices based on historical data.",
      tags: ["Machine Learning", "Python", "Data Science"],
      basedOn: ["Machine Learning", "ML", "Statistics", "Data Mining"]
    }
  ];

  const [recommendations, setRecommendations] = useState<{ title: string; description: string; match: string; tags: string[]; basedOn: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/subjects');
        if (res.ok) {
          const data = await res.json();
          const subjects = Array.isArray(data) ? data : data.subjects || [];
          const subjectNames = subjects.map((s: any) => s.name.toLowerCase());

          const matchedProjects = allProjects.map(proj => {
            let matchCount = 0;
            proj.basedOn.forEach(keyword => {
              if (subjectNames.some((sn: string) => sn.includes(keyword.toLowerCase()))) {
                matchCount++;
              }
            });

            // Calculate a dummy match percentage based on keywords found
            const matchPercent = matchCount > 0 ? Math.min(100, 50 + (matchCount * 15)) : 40;

            return {
              ...proj,
              match: `${matchPercent}% Match`,
              basedOn: proj.basedOn.join(', ')
            };
          }).sort((a, b) => parseInt(b.match) - parseInt(a.match));

          setRecommendations(matchedProjects);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Recommended Projects</h3>
        <p className="text-sm text-muted-foreground">Based on your completed subjects and current semester.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div>Analyzing your subjects to recommend projects...</div>
        ) : recommendations.map(project => (
          <Card key={project.title} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {project.match}
                </Badge>
              </div>
              <CardTitle className="text-xl">{project.title}</CardTitle>
              <CardDescription className="text-xs mt-1">Based on: {project.basedOn}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <p className="text-sm mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
