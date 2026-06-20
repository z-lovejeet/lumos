'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { CalendarDays, MoreVertical, Pencil, Trash } from 'lucide-react'
import { SemesterDialog } from './SemesterDialog'
import { useAcademicStore, type Semester } from '@/stores/academic-store'
import { deleteSemester } from '@/app/(app)/semesters/actions'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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

interface SemesterClientProps {
  initialSemesters: Semester[]
}

export function SemesterClient({ initialSemesters }: SemesterClientProps) {
  const { semesters, setSemesters } = useAcademicStore()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    setSemesters(initialSemesters)
  }, [initialSemesters, setSemesters])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this semester? All related subjects and marks will also be deleted.")) {
      return
    }
    
    setIsDeleting(id)
    try {
      await deleteSemester(id)
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <SemesterDialog />
      </div>

      {semesters.length === 0 ? (
        <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No semesters added</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You haven't added any academic semesters yet. Start by creating your first semester.
            </p>
            <SemesterDialog />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {semesters.map((semester) => (
            <Card key={semester.id} className={semester.isActive ? "border-primary" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">
                  {semester.name}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  } />
                  <DropdownMenuContent align="end">
                    <SemesterDialog 
                      semester={semester} 
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                      } 
                    />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(semester.id)}
                      disabled={isDeleting === semester.id}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>{isDeleting === semester.id ? 'Deleting...' : 'Delete'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mt-2">
                  {semester.startDate && format(new Date(semester.startDate), "MMM d, yyyy")} 
                  {semester.startDate && semester.endDate && ' - '}
                  {semester.endDate && format(new Date(semester.endDate), "MMM d, yyyy")}
                </div>
              </CardContent>
              <CardFooter>
                {semester.isActive && (
                  <Badge variant="default" className="w-full justify-center">Active Semester</Badge>
                )}
                {!semester.isActive && (
                  <Badge variant="secondary" className="w-full justify-center text-muted-foreground">Inactive</Badge>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
