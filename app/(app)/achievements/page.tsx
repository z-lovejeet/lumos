'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Star, Award, GraduationCap, Target, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AchievementDef {
  key: string;
  title: string;
  description: string;
}

interface Achievement {
  id: string;
  achievementKey: string;
  earnedAt: string;
}

export default function AchievementsPage() {
  const [definitions, setDefinitions] = useState<AchievementDef[]>([]);
  const [earned, setEarned] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const res = await fetch('/api/achievements');
        if (!res.ok) throw new Error('Failed to fetch');
        
        const data = await res.json();
        setDefinitions(data.definitions);
        setEarned(data.earned);

        // Toast new achievements if any
        if (data.newUnlocked && data.newUnlocked.length > 0) {
          data.newUnlocked.forEach((key: string) => {
            const def = data.definitions.find((d: any) => d.key === key);
            if (def) {
              toast({
                title: "Achievement Unlocked! 🏆",
                description: def.title,
                variant: "default",
              });
            }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchAchievements();
  }, [toast]);

  const getIcon = (key: string, isEarned: boolean) => {
    if (!isEarned) return <Lock className="h-6 w-6 text-slate-400" />;
    
    switch (key) {
      case 'first-subject': return <Target className="h-6 w-6 text-blue-500" />;
      case 'high-achiever': return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'perfect-attendance': return <Star className="h-6 w-6 text-green-500" />;
      case 'planner': return <GraduationCap className="h-6 w-6 text-purple-500" />;
      case 'perfect-semester': return <Medal className="h-6 w-6 text-red-500" />;
      default: return <Award className="h-6 w-6 text-indigo-500" />;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading achievements...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Achievements</h1>
        <p className="text-muted-foreground mt-2">
          Track your academic milestones, badges, and progress.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {definitions.map((def) => {
          const earnedRecord = earned.find(e => e.achievementKey === def.key);
          const isEarned = !!earnedRecord;

          return (
            <Card key={def.key} className={`transition-all ${isEarned ? 'border-primary/50 shadow-sm' : 'opacity-70 grayscale-[0.5]'}`}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className={`p-3 rounded-full ${isEarned ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {getIcon(def.key, isEarned)}
                </div>
                <div>
                  <CardTitle className="text-lg">{def.title}</CardTitle>
                  {isEarned && (
                    <span className="text-xs text-muted-foreground">
                      Earned {new Date(earnedRecord.earnedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {def.description}
                </CardDescription>
                {!isEarned && (
                  <Badge variant="secondary" className="mt-4">
                    Locked
                  </Badge>
                )}
                {isEarned && (
                  <Badge variant="default" className="mt-4 bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                    Unlocked
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
