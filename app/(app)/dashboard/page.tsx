import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { OverviewCards, DashboardMetrics } from '@/components/dashboard/OverviewCards'
import { SGPATrendChart } from '@/components/charts/SGPATrendChart'
import { CGPAProgressionChart } from '@/components/charts/CGPAProgressionChart'
import { AttendanceHeatmap } from '@/components/charts/AttendanceHeatmap'
import { SubjectComparisonChart } from '@/components/charts/SubjectComparisonChart'
import { GradeDistributionPie } from '@/components/charts/GradeDistributionPie'
import { CreditWeightedChart } from '@/components/charts/CreditWeightedChart'
import { calculateSGPA, SubjectForSGPA } from '@/lib/calculations/sgpa'
import { predictGrade } from '@/lib/predictions/grade-predictor'
import { calculateCGPA } from '@/lib/calculations/cgpa'

export const metadata = {
  title: 'Dashboard - AcademiQ',
  description: 'Your academic overview',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all semesters
  const allSemesters = await prisma.semester.findMany({
    where: { userId: user.id },
    include: {
      subjects: {
        include: {
          marks: true,
          attendance: true,
          markingScheme: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  const gradeScaleRecord = await prisma.gradeScale.findFirst({
    where: { userId: user.id, isActive: true }
  })
  const gradeScale = gradeScaleRecord ? (gradeScaleRecord.grades as any) : []

  const activeSemester = allSemesters.find(s => s.status === 'active')

  if (!activeSemester) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Card className="border-dashed border-2 bg-muted/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Welcome to AcademiQ!</CardTitle>
            <CardDescription className="text-base">
              You haven't set up an active semester yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <Link href="/semesters">
              <Button size="lg">
                <CalendarDays className="mr-2 h-5 w-5" />
                Set Up First Semester
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculations for active semester
  let currentSgpaSubjects: SubjectForSGPA[] = []
  let predictedSgpaSubjects: SubjectForSGPA[] = []
  let attendanceTotal = 0
  let attendanceAttended = 0
  let weakestSub = { name: '', score: 101 }
  let strongestSub = { name: '', score: -1 }

  const subjectComparisonData: any[] = []
  const creditWeightedData: any[] = []
  const gradeDistMap: Record<string, number> = {}

  activeSemester.subjects.forEach(sub => {
    let earnedMarks = 0;
    let totalMarks = 0;
    sub.marks.forEach(m => {
      earnedMarks += (m.obtainedMarks || 0)
      totalMarks += m.maxMarks
    })
    
    let currentPct = totalMarks > 0 ? (earnedMarks / totalMarks) * 100 : 0
    currentSgpaSubjects.push({ credits: sub.credits, percentage: currentPct })

    let components = sub.markingScheme ? (sub.markingScheme.components as any) : []
    const prediction = predictGrade(sub.marks.map(m => ({ componentName: m.componentName, obtainedMarks: m.obtainedMarks || 0, maxMarks: m.maxMarks })), components, gradeScale)
    
    predictedSgpaSubjects.push({ credits: sub.credits, percentage: prediction.predictedPercentage })

    if (prediction.predictedPercentage < weakestSub.score) {
      weakestSub = { name: sub.name, score: prediction.predictedPercentage }
    }
    if (prediction.predictedPercentage > strongestSub.score) {
      strongestSub = { name: sub.name, score: prediction.predictedPercentage }
    }

    sub.attendance.forEach(a => {
      attendanceTotal++
      if (a.attended) attendanceAttended++
    })

    subjectComparisonData.push({
      subject: sub.code,
      percentage: Math.round(prediction.predictedPercentage)
    })

    creditWeightedData.push({
      subject: sub.code,
      credits: sub.credits,
      percentage: Math.round(prediction.predictedPercentage)
    })

    const grade = prediction.predictedGrade || 'N/A'
    gradeDistMap[grade] = (gradeDistMap[grade] || 0) + 1
  })

  const gradeDistData = Object.keys(gradeDistMap).map(k => ({ grade: k, count: gradeDistMap[k] }))

  const currentSgpa = calculateSGPA(currentSgpaSubjects, gradeScale)
  const predictedSgpa = calculateSGPA(predictedSgpaSubjects, gradeScale)
  
  const creditsCompleted = activeSemester.subjects.reduce((sum, s) => sum + s.credits, 0)
  const attendancePercentage = attendanceTotal > 0 ? (attendanceAttended / attendanceTotal) * 100 : 100

  // CGPA and Trend
  const sgpaTrendData: any[] = []
  const cgpaProgressionData: any[] = []
  
  let cgpaSemesters: any[] = []

  allSemesters.forEach(sem => {
    let semSgpaSubs: SubjectForSGPA[] = []
    sem.subjects.forEach(sub => {
      let components = sub.markingScheme ? (sub.markingScheme.components as any) : []
      const prediction = predictGrade(sub.marks.map(m => ({ componentName: m.componentName, obtainedMarks: m.obtainedMarks || 0, maxMarks: m.maxMarks })), components, gradeScale)
      semSgpaSubs.push({ credits: sub.credits, percentage: prediction.predictedPercentage })
    })
    const semSgpa = calculateSGPA(semSgpaSubs, gradeScale)
    sgpaTrendData.push({ semester: sem.name, sgpa: semSgpa })
    
    cgpaSemesters.push({ sgpa: semSgpa, totalCredits: sem.subjects.reduce((sum, s) => sum + s.credits, 0) })
    cgpaProgressionData.push({ semester: sem.name, cgpa: calculateCGPA(cgpaSemesters) })
  })

  const currentCgpa = cgpaSemesters.length > 0 ? calculateCGPA(cgpaSemesters) : 0

  const metrics: DashboardMetrics = {
    currentSgpa,
    predictedSgpa,
    cgpa: currentCgpa,
    creditsCompleted,
    attendancePercentage,
    upcomingExamsCount: 0, // Mock for now
    pendingAssignmentsCount: 0, // Mock for now
    weakestSubject: weakestSub.name,
    strongestSubject: strongestSub.name
  }

  // Attendance Heatmap Mock (Last 30 days)
  const heatmapData = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    heatmapData.push({
      date: d.toISOString().split('T')[0],
      status: Math.random() > 0.8 ? 'missed' : Math.random() > 0.3 ? 'attended' : 'none' as any
    })
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
      </div>

      <OverviewCards metrics={metrics} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-4">
          <SGPATrendChart data={sgpaTrendData} />
          <SubjectComparisonChart data={subjectComparisonData} />
        </div>
        <div className="col-span-3 space-y-4">
          <CGPAProgressionChart data={cgpaProgressionData} />
          <GradeDistributionPie data={gradeDistData} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <AttendanceHeatmap data={heatmapData} />
        </div>
        <div className="col-span-3">
          <CreditWeightedChart data={creditWeightedData} />
        </div>
      </div>
    </div>
  )
}
