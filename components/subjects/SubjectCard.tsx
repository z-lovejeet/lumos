'use client'

import Link from 'next/link'
import { MoreVertical, Pencil, Trash } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SubjectCardProps {
  subject: any
  onDelete?: (id: string) => void
  isDeleting?: string | null
}

export function SubjectCard({ subject, onDelete, isDeleting }: SubjectCardProps) {
  return (
    <Card className="overflow-hidden border-t-4 border-t-blue-500 hover:shadow-md transition-shadow relative">
      <Link href={`/subjects/${subject.id}`} className="absolute inset-0 z-0">
        <span className="sr-only">View subject details</span>
      </Link>
      
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-10">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold truncate pr-2 hover:underline">
            <Link href={`/subjects/${subject.id}`}>
              {subject.code}
            </Link>
          </CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2" title={subject.name}>
            {subject.name}
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 p-0 shrink-0 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground outline-none">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href={`/subjects/${subject.id}`} className="flex w-full items-center">
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </Link>
            </DropdownMenuItem>
            {onDelete && (
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(subject.id)}
                disabled={isDeleting === subject.id}
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>{isDeleting === subject.id ? 'Deleting...' : 'Delete'}</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="relative z-10 pointer-events-none">
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
  )
}
