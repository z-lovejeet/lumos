import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Briefcase, Globe, GraduationCap, Code } from "lucide-react";

export default function CareerDashboard() {
  const options = [
    {
      title: "MS Abroad Readiness",
      description: "Analyze your profile, CGPA, and test scores for top universities.",
      icon: <Globe className="w-8 h-8 mb-4 text-blue-500" />,
      href: "/career/ms-abroad"
    },
    {
      title: "TUM Specific Planner",
      description: "Checklist and curriculum mapping specifically for Technical University of Munich.",
      icon: <GraduationCap className="w-8 h-8 mb-4 text-orange-500" />,
      href: "/career/tum"
    },
    {
      title: "Internship Tracker",
      description: "Manage your applications, interviews, and offers in one place.",
      icon: <Briefcase className="w-8 h-8 mb-4 text-green-500" />,
      href: "/career/internships"
    },
    {
      title: "Project Recommender",
      description: "Discover projects tailored to your completed subjects and skills.",
      icon: <Code className="w-8 h-8 mb-4 text-purple-500" />,
      href: "/career/projects"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {options.map(option => (
        <Card key={option.title} className="flex flex-col">
          <CardHeader>
            {option.icon}
            <CardTitle className="text-xl">{option.title}</CardTitle>
            <CardDescription>{option.description}</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto pt-4">
            <Link href={option.href} className="w-full">
              <Button className="w-full" variant="outline">
                Open <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
