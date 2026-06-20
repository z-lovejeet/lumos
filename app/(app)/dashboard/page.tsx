import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, BookOpen, Calculator, Target, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

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

  // Fetch the active semester
  const activeSemester = await prisma.semester.findFirst({
    where: { userId: user.id, status: 'active' },
    include: {
      subjects: true
    }
  })

  const totalSemesters = await prisma.semester.count({ where: { userId: user.id } })
  const totalSubjects = activeSemester?.subjects.length || 0
  const totalCredits = activeSemester?.subjects.reduce((sum, s) => sum + s.credits, 0) || 0

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {!activeSemester ? (
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
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Semester</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate">{activeSemester.name}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeSemester.startDate && format(new Date(activeSemester.startDate), "MMM d")} 
                  {activeSemester.startDate && activeSemester.endDate && ' - '}
                  {activeSemester.endDate && format(new Date(activeSemester.endDate), "MMM d, yyyy")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSubjects}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enrolled in current semester
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCredits}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Credits in active semester
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Target GPA</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Set up What-If Strategy
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Current Subjects</CardTitle>
                <CardDescription>
                  Your enrolled subjects for {activeSemester.name}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeSemester.subjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center space-y-3">
                    <p className="text-sm text-muted-foreground">No subjects added to this semester yet.</p>
                    <Link href="/subjects">
                      <Button variant="outline" size="sm">Add Subjects</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeSemester.subjects.map(subject => (
                      <div key={subject.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-10 rounded-full bg-blue-500" />
                          <div>
                            <p className="text-sm font-medium leading-none">{subject.code}</p>
                            <p className="text-sm text-muted-foreground">{subject.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{subject.credits} CR</p>
                          <Link href={`/subjects`} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 justify-end">
                            View <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Upcoming Assessments</CardTitle>
                <CardDescription>
                  Track your deadlines and exams.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-40 text-center space-y-3">
                  <p className="text-sm text-muted-foreground">Assessment tracking coming soon in marks entry.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
