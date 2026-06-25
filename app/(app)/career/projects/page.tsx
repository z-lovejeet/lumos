"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProjectsPage() {
  const recommendations = [
    {
      title: "AI Academic Tracker",
      description: "Build a full-stack Next.js application using React, TypeScript, and Supabase.",
      match: "95% Match",
      tags: ["Web Dev", "AI", "Database"],
      basedOn: "Web Programming, DBMS, AI"
    },
    {
      title: "Microservices Deployment Pipeline",
      description: "Create a scalable CI/CD pipeline using Docker and Kubernetes.",
      match: "85% Match",
      tags: ["DevOps", "Cloud", "Architecture"],
      basedOn: "Cloud Computing, Computer Networks"
    },
    {
      title: "Stock Price Prediction Engine",
      description: "Use Linear Regression and LSTM to predict future stock prices based on historical data.",
      match: "75% Match",
      tags: ["Machine Learning", "Python", "Data Science"],
      basedOn: "Machine Learning, Statistics"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Recommended Projects</h3>
        <p className="text-sm text-muted-foreground">Based on your completed subjects and current semester.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map(project => (
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
