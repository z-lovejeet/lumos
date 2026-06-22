import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { analyzeSemesterHealth } from '@/lib/analysis/semester-health'
import { RiskAlerts } from '@/components/dashboard/RiskAlerts'

export const metadata = {
  title: 'Semester Health Analysis - AcademiQ',
  description: 'AI-driven analysis of your semester performance',
}

export default async function HealthPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [activeSemester, gradeScaleRecord] = await Promise.all([
    prisma.semester.findFirst({
      where: { userId: user.id, status: 'active' },
      include: {
        subjects: {
          include: {
            marks: true,
            attendance: true,
            markingScheme: true
          }
        }
      }
    }),
    prisma.gradeScale.findFirst({
      where: { userId: user.id, isActive: true }
    })
  ]);

  const gradeScale = gradeScaleRecord ? (gradeScaleRecord.grades as any) : []

  if (!activeSemester) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Semester Health Analysis</h2>
        <Card className="bg-muted/20">
          <CardHeader>
            <CardTitle>No Active Semester</CardTitle>
            <CardDescription>Please set up an active semester to view health insights.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Format data for analysis
  const subjectsData = activeSemester.subjects.map(sub => {
    let attended = 0;
    sub.attendance.forEach(a => { if(a.attended) attended++; })
    return {
      id: sub.id,
      name: sub.name,
      credits: sub.credits,
      marks: sub.marks.map(m => ({ componentName: m.componentName, obtainedMarks: m.obtainedMarks || 0, maxMarks: m.maxMarks })),
      components: sub.markingScheme ? (sub.markingScheme.components as any) : [],
      attendance: { attended, total: sub.attendance.length }
    }
  })

  const healthData = {
    subjects: subjectsData,
    gradeScale: gradeScale,
    targetSgpa: 8.0 // Mock target SGPA for now
  }

  const healthAnalysis = analyzeSemesterHealth(healthData)

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Semester Health Analysis</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Overall Health Score</CardTitle>
              <CardDescription>Calculated from 0 to 100</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-bold tracking-tighter">{healthAnalysis.score}</span>
                <span className="text-xl text-muted-foreground mb-2">/ 100</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <RiskAlerts health={healthAnalysis} />
        </div>
      </div>
    </div>
  )
}
