'use client'

import { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { SubjectCard } from './SubjectCard'
import { useAcademicStore, type Subject, type Semester } from '@/stores/academic-store'
import { deleteSubject } from '@/app/(app)/subjects/actions'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

interface SubjectClientProps {
  initialSubjects: (Subject & { semester: { name: string } })[]
  initialSemesters: Semester[]
}

export function SubjectClient({ initialSubjects, initialSemesters }: SubjectClientProps) {
  const { setSubjects, setSemesters } = useAcademicStore()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    setSubjects(initialSubjects)
    setSemesters(initialSemesters)
  }, [initialSubjects, initialSemesters, setSubjects, setSemesters])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject? All related marks and schemes will be lost.")) {
      return
    }
    
    setIsDeleting(id)
    try {
      await deleteSubject(id)
    } finally {
      setIsDeleting(null)
    }
  }

  const groupedSubjects = initialSubjects.reduce((acc, subject) => {
    const semName = subject.semester?.name || 'Unknown Semester'
    if (!acc[semName]) acc[semName] = []
    acc[semName].push(subject)
    return acc
  }, {} as Record<string, typeof initialSubjects>)

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {initialSemesters.length === 0 ? (
          <Button disabled>Add Subject (Requires Semester)</Button>
        ) : (
          <Button>
            <Link href="/subjects/new">Add Subject</Link>
          </Button>
        )}
      </div>

      {initialSubjects.length === 0 ? (
        <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No subjects added</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You haven't added any subjects yet. Start by creating a subject for your semester.
            </p>
            {initialSemesters.length > 0 && (
              <Button>
                <Link href="/subjects/new">Add Subject</Link>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSubjects).map(([semesterName, semSubjects]) => (
            <div key={semesterName} className="space-y-4">
              <h3 className="text-lg font-semibold tracking-tight border-b pb-2">{semesterName}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {semSubjects.map((subject) => (
                  <SubjectCard 
                    key={subject.id} 
                    subject={subject} 
                    onDelete={handleDelete}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
