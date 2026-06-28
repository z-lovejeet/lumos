'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { CalendarDays, MoreVertical, Pencil, Trash } from 'lucide-react'
import { SemesterDialog } from './SemesterDialog'
import { useAcademicStore, type Semester } from '@/stores/academic-store'
import { deleteSemester } from '@/app/(app)/semesters/actions'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { StaggerContainer } from '@/components/motion/StaggerContainer'
import { AnimatedCard } from '@/components/motion/AnimatedCard'
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
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null)

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

      {editingSemester && (
        <SemesterDialog 
          semester={editingSemester} 
          open={true} 
          onOpenChange={(open) => {
            if (!open) setEditingSemester(null)
          }} 
          onSuccess={() => setEditingSemester(null)}
        />
      )}

      {semesters.length === 0 ? (
        <div className="relative">
          <EmptyState
            icon={CalendarDays}
            title="No semesters added"
            description="You haven't added any academic semesters yet. Start by creating your first semester."
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <SemesterDialog />
          </div>
        </div>
      ) : (
        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {semesters.map((semester) => (
            <AnimatedCard key={semester.id} className="h-full">
              <Card className={`h-full flex flex-col ${semester.status === 'active' ? "border-primary/50 shadow-sm bg-card/90 backdrop-blur-sm" : ""}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold">
                    {semester.name}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 p-0 shrink-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground outline-none">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px] glass">
                      <DropdownMenuItem 
                        onClick={() => setEditingSemester(semester)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
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
                <CardContent className="flex-1">
                  <div className="text-sm text-muted-foreground mt-2 font-medium">
                    {semester.startDate && format(new Date(semester.startDate), "MMM d, yyyy")} 
                    {semester.startDate && semester.endDate && ' - '}
                    {semester.endDate && format(new Date(semester.endDate), "MMM d, yyyy")}
                  </div>
                </CardContent>
                <CardFooter className="pt-4 mt-auto border-t border-border/40">
                  {semester.status === 'active' && (
                    <Badge variant="default" className="w-full justify-center bg-primary/10 text-primary hover:bg-primary/20 border-transparent transition-colors">Active Semester</Badge>
                  )}
                  {semester.status !== 'active' && (
                    <Badge variant="secondary" className="w-full justify-center text-muted-foreground bg-muted/50 border-transparent">Inactive</Badge>
                  )}
                </CardFooter>
              </Card>
            </AnimatedCard>
          ))}
        </StaggerContainer>
      )}
    </div>
  )
}
