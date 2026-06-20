import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { SubjectCard } from '@/components/subjects/SubjectCard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'

export default async function SemesterDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const semester = await prisma.semester.findUnique({
    where: { id: params.id, userId: user.id },
    include: {
      subjects: true,
    }
  })

  if (!semester) {
    return (
      <div className="container max-w-4xl py-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Semester Not Found</h2>
        <Button>
          <Link href="/semesters">Back to Semesters</Link>
        </Button>
      </div>
    )
  }

  const activeCredits = semester.subjects.reduce((acc, sub) => acc + sub.credits, 0)

  return (
    <div className="container max-w-6xl py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="-ml-2 mr-4">
            <Link href="/semesters" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{semester.name}</h1>
            <p className="text-muted-foreground">
              Total Credits: {activeCredits} • Status: <span className="capitalize">{semester.status}</span>
            </p>
          </div>
        </div>
        <Button>
          <Link href="/subjects/new" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {semester.subjects.length > 0 ? (
            semester.subjects.map(subject => (
              <SubjectCard key={subject.id} subject={subject} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg">
              <h3 className="text-lg font-medium mb-2">No subjects yet</h3>
              <p className="text-muted-foreground mb-4">Start adding subjects to this semester.</p>
              <Button variant="outline">
                <Link href="/subjects/new">Add First Subject</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
