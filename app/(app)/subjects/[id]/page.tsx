import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { SubjectForm } from '@/components/subjects/SubjectForm'
import { MarksTable } from '@/components/subjects/MarksTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SubjectOverview } from '@/components/subjects/SubjectOverview'
import { AttendanceTab } from '@/components/subjects/AttendanceTab'
import { NotesTab } from '@/components/subjects/NotesTab'
import { PredictionTab } from '@/components/subjects/PredictionTab'
import { PYQsTab } from '@/components/subjects/PYQsTab'
import { calculateSubjectPercentage } from '@/lib/calculations/percentage'
import { getGradeFromPercentage, GradeRange } from '@/lib/calculations/sgpa'
import defaultGradeScale from '@/data/default-grade-scale.json'

export default async function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [subject, semesters, markingSchemes, gradeScale] = await Promise.all([
    prisma.subject.findUnique({
      where: { id: id, userId: user.id },
      include: {
        marks: true,
        markingScheme: true,
      }
    }),
    prisma.semester.findMany({
      where: { userId: user.id },
      orderBy: { number: 'desc' }
    }),
    prisma.markingScheme.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.gradeScale.findFirst({
      where: { userId: user.id, isActive: true }
    })
  ])

  if (!subject) {
    return (
      <div className="container max-w-4xl py-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Subject Not Found</h2>
        <Link href="/subjects" className={buttonVariants()}>Back to Subjects</Link>
      </div>
    )
  }

  // Calculate overview metrics
  let percentage = 0;
  let grade = 'N/A';

  if (subject.markingScheme) {
    // Component schema inside MarkingScheme is JSON
    const components = subject.markingScheme.components as any[];
    percentage = calculateSubjectPercentage(subject.marks, components);
  }

  if (gradeScale) {
    const ranges = gradeScale.grades as any[] as GradeRange[];
    grade = getGradeFromPercentage(percentage, ranges);
  }

  return (
    <div className="container max-w-5xl py-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link href="/subjects" className={buttonVariants({ variant: "ghost", size: "sm", className: "-ml-2 mr-4 flex items-center" })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{subject.code} - {subject.name}</h1>
            <p className="text-muted-foreground">
              {subject.credits} Credits • {subject.category} {subject.facultyName ? `• Prof: ${subject.facultyName}` : ''}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="marks">Marks</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="pyqs">PYQs</TabsTrigger>
          <TabsTrigger value="prediction">Prediction</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SubjectOverview 
            subject={subject} 
            percentage={percentage} 
            grade={grade} 
          />
          <Card>
            <CardHeader>
              <CardTitle>Edit Subject Details</CardTitle>
              <CardDescription>
                Update the core information about this subject.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubjectForm 
                subject={subject} 
                semesters={semesters} 
                markingSchemes={markingSchemes} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marks">
          <Card>
            <CardHeader>
              <CardTitle>Marks Entry</CardTitle>
              <CardDescription>
                Enter your obtained marks. This will auto-save.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarksTable 
                subject={subject} 
                gradeScaleRanges={gradeScale ? (gradeScale.grades as any[]) : []} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <AttendanceTab subjectId={subject.id} />
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <NotesTab subjectId={subject.id} />
          </Card>
        </TabsContent>

        <TabsContent value="pyqs">
          <Card>
            <PYQsTab />
          </Card>
        </TabsContent>

        <TabsContent value="prediction">
          <Card>
            <PredictionTab 
              subject={subject} 
              gradeScale={gradeScale ? (gradeScale.grades as any[]) : defaultGradeScale} 
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
