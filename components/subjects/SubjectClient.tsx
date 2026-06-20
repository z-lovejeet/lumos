'use client'

import { useEffect, useState } from 'react'
import { BookOpen, MoreVertical, Pencil, Trash } from 'lucide-react'
import { SubjectDialog } from './SubjectDialog'
import { useAcademicStore, type Subject, type Semester } from '@/stores/academic-store'
import { deleteSubject } from '@/app/(app)/subjects/actions'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface SubjectClientProps {
  initialSubjects: (Subject & { semester: { name: string } })[]
  initialSemesters: Semester[]
  initialMarkingSchemes: any[]
}

export function SubjectClient({ initialSubjects, initialSemesters, initialMarkingSchemes }: SubjectClientProps) {
  const { subjects, setSubjects, semesters, setSemesters } = useAcademicStore()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    // We update local state
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

  // Filter subjects by active semester if one is active, otherwise show all
  // But wait, the user might want to see all subjects or filter them by semester.
  // For now we just group them by semester.

  const groupedSubjects = initialSubjects.reduce((acc, subject) => {
    const semName = subject.semester?.name || 'Unknown Semester'
    if (!acc[semName]) acc[semName] = []
    acc[semName].push(subject)
    return acc
  }, {} as Record<string, typeof initialSubjects>)

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {semesters.length === 0 ? (
          <Button disabled>Add Subject (Requires Semester)</Button>
        ) : (
          <SubjectDialog semesters={initialSemesters} markingSchemes={initialMarkingSchemes} />
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
            {semesters.length > 0 && <SubjectDialog semesters={initialSemesters} markingSchemes={initialMarkingSchemes} />}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSubjects).map(([semesterName, semSubjects]) => (
            <div key={semesterName} className="space-y-4">
              <h3 className="text-lg font-semibold tracking-tight border-b pb-2">{semesterName}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {semSubjects.map((subject) => (
                  <Card key={subject.id} className="overflow-hidden border-t-4" style={{ borderTopColor: subject.colorCode || '#3b82f6' }}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-xl font-bold truncate pr-2">
                          {subject.code}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2" title={subject.name}>
                          {subject.name}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end">
                          <SubjectDialog 
                            subject={subject} 
                            semesters={initialSemesters}
                            markingSchemes={initialMarkingSchemes}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                            } 
                          />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(subject.id)}
                            disabled={isDeleting === subject.id}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>{isDeleting === subject.id ? 'Deleting...' : 'Delete'}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 mt-4">
                        <Badge variant="secondary">{subject.credits} Credits</Badge>
                        <Badge variant="outline">{subject.category}</Badge>
                      </div>
                      {subject.facultyName && (
                        <p className="text-xs text-muted-foreground mt-3 truncate">
                          Prof: {subject.facultyName}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
