import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { calculateSGPA, SubjectForSGPA } from '@/lib/calculations/sgpa'
import { predictGrade } from '@/lib/predictions/grade-predictor'

export const metadata = {
  title: 'Compare Semesters - Lumos',
  description: 'Side-by-side semester comparison',
}

export default async function ComparePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [allSemesters, gradeScaleRecord] = await Promise.all([
    prisma.semester.findMany({
      where: { userId: user.id },
      include: {
        subjects: {
          include: {
            marks: true,
            markingScheme: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.gradeScale.findFirst({
      where: { userId: user.id, isActive: true }
    })
  ]);

  const gradeScale = gradeScaleRecord ? (gradeScaleRecord.grades as any) : []

  if (allSemesters.length < 2) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Semester Comparison</h2>
        <Card className="bg-muted/20">
          <CardHeader>
            <CardTitle>Not enough data</CardTitle>
            <CardDescription>You need at least 2 semesters to use the comparison tool.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Take the last two semesters for simple side-by-side
  const sem1 = allSemesters[0];
  const sem2 = allSemesters[1];

  const calcSemMetrics = (sem: any) => {
    let semSgpaSubs: SubjectForSGPA[] = []
    let topSubject = { name: '', score: -1 }
    let totalCredits = 0
    
    sem.subjects.forEach((sub: any) => {
      let components = sub.markingScheme ? (sub.markingScheme.components as any) : []
      const prediction = predictGrade(sub.marks.map((m: any) => ({ componentName: m.componentName, obtainedMarks: m.obtainedMarks || 0, maxMarks: m.maxMarks })), components, gradeScale)
      semSgpaSubs.push({ credits: sub.credits, percentage: prediction.predictedPercentage })
      totalCredits += sub.credits

      if (prediction.predictedPercentage > topSubject.score) {
        topSubject = { name: sub.name, score: prediction.predictedPercentage }
      }
    })
    
    return {
      sgpa: calculateSGPA(semSgpaSubs, gradeScale),
      credits: totalCredits,
      topSubject: topSubject.name
    }
  }

  const metrics1 = calcSemMetrics(sem1);
  const metrics2 = calcSemMetrics(sem2);

  const diffSgpa = metrics1.sgpa - metrics2.sgpa;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Semester Comparison</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/50 border-2">
          <CardHeader>
            <CardTitle>{sem1.name}</CardTitle>
            <CardDescription>Most Recent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">SGPA</p>
              <p className="text-3xl font-bold">{metrics1.sgpa.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Credits</p>
              <p className="text-xl font-semibold">{metrics1.credits}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Top Subject</p>
              <p className="text-lg font-medium">{metrics1.topSubject || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{sem2.name}</CardTitle>
            <CardDescription>Previous Semester</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">SGPA</p>
              <p className="text-3xl font-bold">{metrics2.sgpa.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Credits</p>
              <p className="text-xl font-semibold">{metrics2.credits}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Top Subject</p>
              <p className="text-lg font-medium">{metrics2.topSubject || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/10">
        <CardHeader>
          <CardTitle>Comparison Insight</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            Your SGPA has {diffSgpa > 0 ? <span className="text-emerald-500 font-bold">increased</span> : diffSgpa < 0 ? <span className="text-destructive font-bold">decreased</span> : <span className="font-bold">remained the same</span>} by {Math.abs(diffSgpa).toFixed(2)} points from {sem2.name} to {sem1.name}.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
