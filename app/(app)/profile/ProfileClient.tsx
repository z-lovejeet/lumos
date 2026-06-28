'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GraduationCap, Briefcase, BookOpen, User, Building, Calendar, Save, CheckCircle2, Loader2, Book } from 'lucide-react';
import { updateProfile } from './actions';
import { toast } from 'sonner';
import { StaggerContainer } from '@/components/motion/StaggerContainer';
import { AnimatedCard } from '@/components/motion/AnimatedCard';

interface ProfileClientProps {
  user: any;
  stats: {
    totalSemesters: number;
    totalCredits: number;
  }
}

export function ProfileClient({ user, stats }: ProfileClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const initials = user?.name
    ? user.name.substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);
    
    setIsSubmitting(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Profile updated successfully!');
    }
  };

  return (
    <StaggerContainer className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
      {/* Sidebar Profile Stats */}
      <div className="md:col-span-1 space-y-6">
        <AnimatedCard>
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden relative">
            <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5 absolute top-0 left-0 right-0 pointer-events-none" />
            <CardContent className="pt-12 flex flex-col items-center text-center relative z-10">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl mb-4">
                <AvatarImage src={user.avatarUrl || ''} />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold">{user.name || 'Student'}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              
              <div className="w-full grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-border/50">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
                    <Book className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-bold">{stats.totalSemesters}</span>
                  <span className="text-xs text-muted-foreground">Semesters</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-2">
                    <Award className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-bold">{stats.totalCredits}</span>
                  <span className="text-xs text-muted-foreground">Credits</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>

        {user.achievements && user.achievements.length > 0 && (
          <AnimatedCard>
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" /> Recent Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.achievements.slice(0, 3).map((ach: any) => (
                  <div key={ach.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Award className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{ach.title}</p>
                      <p className="text-xs text-muted-foreground mt-1" suppressHydrationWarning>
                        {new Date(ach.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </AnimatedCard>
        )}
      </div>

      {/* Main Profile Form */}
      <div className="md:col-span-2 lg:col-span-3">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <AnimatedCard>
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> Personal Information
                </CardTitle>
                <CardDescription>Update your personal details and how others see you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    defaultValue={user.name || ''} 
                    placeholder="E.g. John Doe"
                    className="max-w-md"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    name="bio" 
                    defaultValue={user.bio || ''} 
                    placeholder="Tell us a little bit about yourself..."
                    className="min-h-[100px] max-w-xl"
                  />
                  <p className="text-xs text-muted-foreground">This bio will be shown on your public profile if you choose to share your achievements.</p>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard>
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" /> Academic Identity
                </CardTitle>
                <CardDescription>Let Lumos know what and where you are studying.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="university" className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" /> University / College
                    </Label>
                    <Input 
                      id="university" 
                      name="university" 
                      defaultValue={user.university || ''} 
                      placeholder="E.g. Technical University of Munich"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="major" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" /> Degree / Major
                    </Label>
                    <Input 
                      id="major" 
                      name="major" 
                      defaultValue={user.major || ''} 
                      placeholder="E.g. B.Tech Computer Science"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="graduationYear" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" /> Expected Graduation Year
                    </Label>
                    <Input 
                      id="graduationYear" 
                      name="graduationYear" 
                      type="number"
                      min={2000}
                      max={2100}
                      defaultValue={user.graduationYear || ''} 
                      placeholder="E.g. 2026"
                      className="max-w-[200px]"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border/50 px-6 py-4 bg-muted/20">
                <Button type="submit" disabled={isSubmitting} className="ml-auto gap-2 rounded-full">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSubmitting ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </CardFooter>
            </Card>
          </AnimatedCard>
        </form>
      </div>
    </StaggerContainer>
  );
}

// Dummy Award icon for stats since we imported 'Award' later
import { Award } from 'lucide-react';
