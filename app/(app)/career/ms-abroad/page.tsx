"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReadinessRadar } from "@/components/career/ReadinessRadar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MSAbroadProfile, MSReadinessScore } from "@/types/career";

export default function MSAbroadPage() {
  const [profile, setProfile] = useState<MSAbroadProfile>({
    targetCountry: "USA",
    targetTerm: "Fall 2026",
    greScore: 310,
    toeflIeltsScore: 7.5,
    researchPapers: 0,
    workExperienceMonths: 0
  });

  const [score, setScore] = useState<MSReadinessScore | null>(null);
  const [cgpa, setCgpa] = useState<number>(8.5); // Ideally fetched from DB
  const [appProgress, setAppProgress] = useState<number>(20);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real app, we'd calculate this via an API route that accesses DB CGPA and career plan.
    // Simulating it here directly for the UI prototype
    fetchScore();
  }, []);

  const fetchScore = async () => {
    // Calling the API we built earlier
    // But since it relies on DB, let's just do a mock local calculation for the UI if API fails
    setLoading(true);
    try {
      // dynamic import for client-side
      const { analyzeMSReadiness } = await import('@/lib/career/ms-readiness');
      setScore(analyzeMSReadiness(cgpa, profile, appProgress));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    await fetchScore();
    // Here we would POST to /api/career/ms-abroad
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile Details</CardTitle>
          <CardDescription>Update your scores to see readiness</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Country</Label>
              <Input 
                value={profile.targetCountry} 
                onChange={e => setProfile({...profile, targetCountry: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>GRE Score</Label>
              <Input 
                type="number"
                value={profile.greScore || ''} 
                onChange={e => setProfile({...profile, greScore: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-2">
              <Label>IELTS/TOEFL</Label>
              <Input 
                type="number" step="0.5"
                value={profile.toeflIeltsScore || ''} 
                onChange={e => setProfile({...profile, toeflIeltsScore: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Work Experience (Months)</Label>
              <Input 
                type="number"
                value={profile.workExperienceMonths || ''} 
                onChange={e => setProfile({...profile, workExperienceMonths: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Research Papers</Label>
              <Input 
                type="number"
                value={profile.researchPapers || ''} 
                onChange={e => setProfile({...profile, researchPapers: Number(e.target.value)})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Current CGPA</Label>
              <Input 
                type="number" step="0.1"
                value={cgpa} 
                onChange={e => setCgpa(Number(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <Label>Application Progress (%)</Label>
              <Input 
                type="number" step="5" max="100" min="0"
                value={appProgress} 
                onChange={e => setAppProgress(Number(e.target.value))} 
              />
              <p className="text-xs text-muted-foreground">SOP, LORs, Resumes prepared</p>
            </div>
          </div>
          <Button onClick={handleSave} className="w-full" disabled={loading}>
            Calculate Readiness
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Readiness Radar</CardTitle>
          </CardHeader>
          <CardContent>
            {score ? <ReadinessRadar score={score} /> : <div>Loading...</div>}
          </CardContent>
        </Card>

        {score && score.missingFactors.length > 0 && (
          <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-900/10 dark:border-orange-900">
            <CardHeader>
              <CardTitle className="text-orange-600 dark:text-orange-400">Missing Profile Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4 space-y-1 text-sm text-orange-800 dark:text-orange-300">
                {score.missingFactors.map(f => <li key={f}>{f} is missing or 0. Try to improve this area.</li>)}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
