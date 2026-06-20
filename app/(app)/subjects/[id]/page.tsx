import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { SubjectForm } from '@/components/subjects/SubjectForm'
import { MarksTable } from '@/components/subjects/MarksTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function SubjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [subject, semesters, markingSchemes] = await Promise.all([
    prisma.subject.findUnique({
      where: { id: params.id, userId: user.id },
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
    })
  ])

  if (!subject) {
    return (
      <div className="container max-w-4xl py-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Subject Not Found</h2>
        <Button>
          <Link href="/subjects">Back to Subjects</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="-ml-2 mr-4">
            <Link href="/subjects" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{subject.code} - {subject.name}</h1>
            <p className="text-muted-foreground">
              {subject.credits} Credits • {subject.category} {subject.facultyName ? `• Prof: ${subject.facultyName}` : ''}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="marks">Marks</TabsTrigger>
          <TabsTrigger value="attendance" disabled>Attendance</TabsTrigger>
          <TabsTrigger value="notes" disabled>Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
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
              <MarksTable subject={subject} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
