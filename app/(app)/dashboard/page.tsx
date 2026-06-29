import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { OverviewCards, DashboardMetrics } from '@/components/dashboard/OverviewCards'
import { SGPATrendChart } from '@/components/charts/SGPATrendChart'
import { CGPAProgressionChart } from '@/components/charts/CGPAProgressionChart'
import { SubjectAttendanceChart } from '@/components/charts/SubjectAttendanceChart'
import { SubjectComparisonChart } from '@/components/charts/SubjectComparisonChart'
import { GradeDistributionPie } from '@/components/charts/GradeDistributionPie'
import { CreditWeightedChart } from '@/components/charts/CreditWeightedChart'
import { calculateSGPA, SubjectForSGPA } from '@/lib/calculations/sgpa'
import { predictGrade } from '@/lib/predictions/grade-predictor'
import { calculateCGPA } from '@/lib/calculations/cgpa'
import { detectRisks, RiskDetectorData } from '@/lib/alerts/risk-detector'
import { predictPerformanceTrend } from '@/lib/predictions/trend-predictor'
import defaultGradeScale from '@/data/default-grade-scale.json'

export const metadata = {
  title: 'Dashboard - Lumos',
  description: 'Your academic overview',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all semesters, grade scale, and user settings in parallel
  const [allSemesters, gradeScaleRecord, dbUser] = await Promise.all([
    prisma.semester.findMany({
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
    }),
    prisma.gradeScale.findFirst({
      where: { userId: user.id, isActive: true }
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { settings: true }
    })
  ]);
  const rawGradeScale = (gradeScaleRecord && gradeScaleRecord.grades) 
    ? (gradeScaleRecord.grades as any[]) 
    : defaultGradeScale;
  
  const gradeScale: any[] = rawGradeScale.map((g) => ({
    grade: g.grade,
    minPercentage: g.minPercent,
    maxPercentage: 100,
    gpaValue: g.point
  }));
  gradeScale.sort((a, b) => b.minPercentage - a.minPercentage);
  for (let i = 1; i < gradeScale.length; i++) {
    gradeScale[i].maxPercentage = gradeScale[i - 1].minPercentage - 0.01;
  }
  if (gradeScale.length > 0) {
    gradeScale[0].maxPercentage = 100;
  }

  const userSettings = dbUser?.settings as any || {};

  const activeSemester = allSemesters.find(s => s.status === 'active')

  if (!activeSemester) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Card className="border-dashed border-2 bg-muted/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Welcome to Lumos!</CardTitle>
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

  const subjectAttendanceData: any[] = [];

  activeSemester.subjects.forEach(sub => {
    let earnedMarks = 0;
    let totalMarks = 0;
    sub.marks.forEach(m => {
      if (m.obtainedMarks !== null) {
        earnedMarks += m.obtainedMarks;
        totalMarks += m.maxMarks;
      }
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

    const conducted = sub.totalClassesConducted || 0;
    const attended = sub.totalClassesAttended || 0;
    
    attendanceTotal += conducted;
    attendanceAttended += attended;

    subjectAttendanceData.push({
      subject: sub.code || sub.name,
      percentage: conducted > 0 ? Math.round((attended / conducted) * 100) : 100,
      attended,
      conducted
    });

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

  const calculatedCurrentSgpa = calculateSGPA(currentSgpaSubjects, gradeScale)
  const predictedSgpa = calculateSGPA(predictedSgpaSubjects, gradeScale)

  const savedSGPA = userSettings.savedSGPA;
  const isSgpaSaved = savedSGPA !== undefined && savedSGPA !== null;
  const currentSgpa = isSgpaSaved ? savedSGPA : calculatedCurrentSgpa;
  
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
  const savedCGPA = userSettings.savedCGPA;
  const isCgpaSaved = savedCGPA !== undefined && savedCGPA !== null;
  const displayCgpa = isCgpaSaved ? savedCGPA : currentCgpa;

  const metrics: DashboardMetrics = {
    currentSgpa,
    predictedSgpa,
    cgpa: displayCgpa,
    isCgpaSaved,
    isSgpaSaved,
    creditsCompleted,
    attendancePercentage,
    weakestSubject: weakestSub.name,
    strongestSubject: strongestSub.name
  }

  // No longer building heatmap data

  const riskData: RiskDetectorData = {
    subjects: activeSemester.subjects.map(s => ({
      id: s.id,
      name: s.name,
      attendancePercent: s.totalClassesConducted && s.totalClassesConducted > 0 
        ? ((s.totalClassesAttended || 0) / s.totalClassesConducted) * 100 
        : 100,
      marks: s.marks as any[],
      components: s.markingScheme ? s.markingScheme.components as any[] : []
    })),
    gradeScale: gradeScale,
    sgpaTrend: sgpaTrendData.map(d => d.sgpa).reverse()
  };
  const risks = detectRisks(riskData);
  
  const attendanceRisks = risks.filter(r => r.type === 'attendance');
  const otherRisks = risks.filter(r => r.type !== 'attendance');

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-heading">Dashboard Overview</h2>
      </div>

      <OverviewCards metrics={metrics} />

      {otherRisks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" /> 
            Active Risks
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherRisks.map(risk => (
              <Card key={risk.id} className={risk.severity === 'critical' ? 'border-destructive bg-destructive/5' : 'border-amber-500/50 bg-amber-500/5'}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex justify-between items-center">
                    {risk.type === 'attendance' ? 'Attendance Risk' : risk.type === 'trend' ? 'Trend Risk' : 'Academic Risk'}
                    <Badge variant={risk.severity === 'critical' ? 'destructive' : 'outline'} className={risk.severity === 'warning' ? 'text-amber-500 border-amber-500' : ''}>
                      {risk.severity}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{risk.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-col sm:inline-flex sm:flex-row h-auto w-full sm:w-auto bg-muted/50 backdrop-blur-md border border-border/50 p-1 rounded-xl gap-1 sm:gap-0">
          <TabsTrigger value="overview" className="w-full sm:w-auto rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Overview</TabsTrigger>
          <TabsTrigger value="subjects" className="w-full sm:w-auto rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Subject Analysis</TabsTrigger>
          <TabsTrigger value="attendance" className="w-full sm:w-auto rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Attendance & Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <div className="grid gap-6 lg:grid-cols-7">
            <div className="lg:col-span-4 space-y-4">
              <SGPATrendChart data={sgpaTrendData} prediction={predictPerformanceTrend(sgpaTrendData.map(d => d.sgpa))} />
            </div>
            <div className="lg:col-span-3 space-y-4">
              <CGPAProgressionChart data={cgpaProgressionData} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <div className="grid gap-6 lg:grid-cols-7">
            <div className="lg:col-span-4 space-y-4">
              <SubjectComparisonChart data={subjectComparisonData} />
            </div>
            <div className="lg:col-span-3 space-y-4">
              <GradeDistributionPie data={gradeDistData} />
            </div>
          </div>
          <div className="grid gap-6">
            <CreditWeightedChart data={creditWeightedData} />
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          {attendanceRisks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" /> 
                Attendance Alerts
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {attendanceRisks.map(risk => (
                  <Card key={risk.id} className={risk.severity === 'critical' ? 'border-destructive bg-destructive/5' : 'border-amber-500/50 bg-amber-500/5'}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex justify-between items-center">
                        Attendance Risk
                        <Badge variant={risk.severity === 'critical' ? 'destructive' : 'outline'} className={risk.severity === 'warning' ? 'text-amber-500 border-amber-500' : ''}>
                          {risk.severity}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium">{risk.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          <div className="grid gap-6">
            <SubjectAttendanceChart data={subjectAttendanceData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
