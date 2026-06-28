import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Briefcase, Globe, GraduationCap, Code } from "lucide-react";
import { StaggerContainer } from "@/components/motion/StaggerContainer";
import { AnimatedCard } from "@/components/motion/AnimatedCard";

export default function CareerDashboard() {
  const options = [
    {
      title: "MS Abroad Readiness",
      description: "Analyze your profile, CGPA, and test scores for top universities.",
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      href: "/career/ms-abroad"
    },
    {
      title: "TUM Specific Planner",
      description: "Checklist and curriculum mapping specifically for Technical University of Munich.",
      icon: <GraduationCap className="w-6 h-6 text-orange-500" />,
      href: "/career/tum"
    },
    {
      title: "Internship Tracker",
      description: "Manage your applications, interviews, and offers in one place.",
      icon: <Briefcase className="w-6 h-6 text-green-500" />,
      href: "/career/internships"
    },
    {
      title: "Project Recommender",
      description: "Discover projects tailored to your completed subjects and skills.",
      icon: <Code className="w-6 h-6 text-purple-500" />,
      href: "/career/projects"
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Career Planner</h1>
        <p className="text-muted-foreground mt-2">
          Track your internships, analyze your profile for MS abroad, and discover relevant projects.
        </p>
      </div>
      
      <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {options.map(option => (
          <AnimatedCard key={option.title} className="h-full">
            <Card className="flex flex-col h-full hover:shadow-md transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-muted/50 rounded-2xl w-max mb-4">
                  {option.icon}
                </div>
                <CardTitle className="text-xl">{option.title}</CardTitle>
                <CardDescription className="text-sm">{option.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-4">
                <Link href={option.href} className="w-full">
                  <Button className="w-full bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 hover:border-primary/30 transition-colors" variant="outline">
                    Open <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </AnimatedCard>
        ))}
      </StaggerContainer>
    </div>
  );
}
