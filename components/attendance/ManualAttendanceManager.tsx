'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Subject {
  id: string;
  name: string;
  totalClassesConducted: number;
  totalClassesAttended: number;
  totalClassesInSemester: number;
}

interface Props {
  subjects: Subject[];
}

interface TargetBuffer {
  target: number;
  marks: number;
  canMiss: number;
  needToAttend: number;
  status: 'safe' | 'critical' | 'at-target';
}

export function ManualAttendanceManager({ subjects }: Props) {
  const router = useRouter();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [deliveredClasses, setDeliveredClasses] = useState<string>('');
  const [attendedClasses, setAttendedClasses] = useState<string>('');
  const [totalSemesterClasses, setTotalSemesterClasses] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedBuffers, setCalculatedBuffers] = useState<TargetBuffer[] | null>(null);

  // When subject changes, populate fields
  const handleSubjectChange = (id: string | null | any) => {
    if (!id || typeof id !== 'string') return;
    setSelectedSubjectId(id);
    const sub = subjects.find(s => s.id === id);
    if (sub) {
      setDeliveredClasses(sub.totalClassesConducted > 0 ? sub.totalClassesConducted.toString() : '');
      setAttendedClasses(sub.totalClassesAttended > 0 ? sub.totalClassesAttended.toString() : '');
      setTotalSemesterClasses(sub.totalClassesInSemester > 0 ? sub.totalClassesInSemester.toString() : '');
      setCalculatedBuffers(null);
    }
  };

  const calculateBuffers = (attended: number, delivered: number, totalSemester: number) => {
    const targets = [
      { percent: 75, marks: 2 },
      { percent: 81, marks: 3 },
      { percent: 86, marks: 4 },
      { percent: 91, marks: 5 }
    ];

    const results: TargetBuffer[] = targets.map(t => {
      const targetRatio = t.percent / 100;
      const requiredToAttend = Math.ceil(targetRatio * totalSemester);
      const stillNeedToAttend = requiredToAttend - attended;
      const classesLeft = totalSemester - delivered;
      
      if (stillNeedToAttend <= 0) {
        return {
          target: t.percent,
          marks: t.marks,
          canMiss: classesLeft,
          needToAttend: 0,
          status: classesLeft > 0 ? 'safe' : 'at-target'
        };
      }
      
      if (stillNeedToAttend > classesLeft) {
        return {
          target: t.percent,
          marks: t.marks,
          canMiss: 0,
          needToAttend: stillNeedToAttend,
          status: 'critical'
        };
      }

      const missable = classesLeft - stillNeedToAttend;
      return {
        target: t.percent,
        marks: t.marks,
        canMiss: missable,
        needToAttend: stillNeedToAttend,
        status: missable > 0 ? 'safe' : 'at-target'
      };
    });

    setCalculatedBuffers(results);
  };

  const handleSave = async () => {
    if (!selectedSubjectId) {
      toast.error('Please select a subject');
      return;
    }
    
    const delivered = parseInt(deliveredClasses);
    const attended = parseInt(attendedClasses);
    const semesterTotal = parseInt(totalSemesterClasses);

    if (isNaN(delivered) || isNaN(attended) || isNaN(semesterTotal) || delivered <= 0 || attended < 0 || semesterTotal <= 0) {
      toast.error('Please enter valid numbers for all fields');
      return;
    }

    if (attended > delivered) {
      toast.error('Attended classes cannot exceed delivered classes');
      return;
    }

    if (delivered > semesterTotal) {
      toast.error('Delivered classes cannot exceed total classes in semester');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/attendance/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          totalClassesConducted: delivered,
          totalClassesAttended: attended,
          totalClassesInSemester: semesterTotal
        })
      });

      if (!res.ok) {
        throw new Error('Failed to save attendance');
      }

      toast.success('Attendance saved successfully');
      calculateBuffers(attended, delivered, semesterTotal);
      router.refresh(); // Update the server components
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="relative overflow-hidden bg-card/95 backdrop-blur-xl border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
        <CardHeader>
          <CardTitle>Manual Entry</CardTitle>
          <CardDescription>Update your aggregate attendance for a subject</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Subject</Label>
            <Select value={selectedSubjectId} onValueChange={handleSubjectChange}>
              <SelectTrigger className="w-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 transition-colors h-11 rounded-lg">
                <SelectValue placeholder="Choose a subject...">
                  {subjects.find(s => s.id === selectedSubjectId)?.name || 'Choose a subject...'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-md border-border/50 rounded-xl">
                {subjects.map(sub => (
                  <SelectItem key={sub.id} value={sub.id} className="rounded-lg focus:bg-muted/50">{sub.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium whitespace-nowrap">Attended</Label>
              <Input 
                type="number" 
                min="0"
                value={attendedClasses}
                onChange={(e) => setAttendedClasses(e.target.value)}
                placeholder="e.g. 14"
                className="bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 transition-colors h-11 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium whitespace-nowrap">Delivered</Label>
              <Input 
                type="number" 
                min="1"
                value={deliveredClasses}
                onChange={(e) => setDeliveredClasses(e.target.value)}
                placeholder="e.g. 20"
                className="bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 transition-colors h-11 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium whitespace-nowrap text-primary/80">Total</Label>
              <Input 
                type="number" 
                min="1"
                value={totalSemesterClasses}
                onChange={(e) => setTotalSemesterClasses(e.target.value)}
                placeholder="e.g. 50"
                className="bg-primary/5 border-primary/20 focus:bg-background focus:border-primary transition-colors h-11 rounded-lg font-medium"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            onClick={handleSave} 
            disabled={isLoading || subjects.length === 0} 
            className="w-full relative overflow-hidden group shadow-md transition-all hover:shadow-lg hover:brightness-110"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Calculate & Save
          </Button>
        </CardFooter>
      </Card>

      <Card className="relative overflow-hidden bg-card/95 backdrop-blur-xl border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
        <CardHeader>
          <CardTitle>Target Buffers</CardTitle>
          <CardDescription>Classes to miss or attend for marks</CardDescription>
        </CardHeader>
        <CardContent>
          {!calculatedBuffers ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm text-center">
              <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
              Enter attendance and calculate to see<br/>how many classes you can miss for each target.
            </div>
          ) : (
            <div className="space-y-4">
              {calculatedBuffers.map(buffer => (
                <div key={buffer.target} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 transition-colors hover:bg-muted/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{buffer.target}%</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        +{buffer.marks} marks
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {buffer.status === 'safe' ? (
                      <div className="flex items-center gap-1.5 text-emerald-500 font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        Miss {buffer.canMiss} classes
                      </div>
                    ) : buffer.status === 'at-target' ? (
                      <div className="text-amber-500 font-medium">
                        Exactly at target
                      </div>
                    ) : (
                      <div className="text-destructive font-medium">
                        Attend {buffer.needToAttend} classes
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
