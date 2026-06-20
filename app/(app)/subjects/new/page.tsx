import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { SubjectForm } from '@/components/subjects/SubjectForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewSubjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [semesters, markingSchemes] = await Promise.all([
    prisma.semester.findMany({
      where: { userId: user.id },
      orderBy: { number: 'desc' }
    }),
    prisma.markingScheme.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
  ])

  if (semesters.length === 0) {
    return (
      <div className="container max-w-4xl py-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">No Semesters Found</h2>
          <p className="text-muted-foreground mb-6">You need to create a semester before you can add a subject.</p>
          <Button>
            <Link href="/semesters">Go to Semesters</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-6">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="sm" className="-ml-2 mr-4">
          <Link href="/subjects" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>

      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Subject</CardTitle>
          <CardDescription>
            Create a new subject and assign it to a semester.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubjectForm semesters={semesters} markingSchemes={markingSchemes} />
        </CardContent>
      </Card>
    </div>
  )
}
