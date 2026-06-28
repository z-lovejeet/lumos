import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { MarksClient } from '@/components/marks/MarksClient'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Marks Entry - Lumos',
  description: 'Enter marks for your active subjects',
}

export default async function MarksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the active semester
  const activeSemester = await prisma.semester.findFirst({
    where: { userId: user.id, status: 'active' },
    include: {
      subjects: {
        include: {
          markingScheme: true,
          marks: true
        }
      }
    }
  })

  if (!activeSemester) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Marks Entry</h2>
        <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">No active semester</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You need an active semester to enter marks.
            </p>
            <Link href="/semesters">
              <Button>Go to Semesters</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Marks Entry</h2>
          <p className="text-muted-foreground">Active Semester: {activeSemester.name}</p>
        </div>
      </div>
      
      <MarksClient subjects={activeSemester.subjects} />
    </div>
  )
}
