'use client'

import { useState } from 'react'
import { Award, MoreVertical, Pencil, Trash } from 'lucide-react'
import { GradeScaleDialog } from './GradeScaleDialog'
import { deleteGradeScale } from '@/app/(app)/grade-scales/actions'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface GradeScaleClientProps {
  initialScales: any[]
}

export function GradeScaleClient({ initialScales }: GradeScaleClientProps) {
  const [scales, setScales] = useState(initialScales)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this grade scale?")) {
      return
    }
    
    setIsDeleting(id)
    try {
      await deleteGradeScale(id)
      setScales(prev => prev.filter(s => s.id !== id))
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <GradeScaleDialog onSuccess={() => window.location.reload()} />
      </div>

      {scales.length === 0 ? (
        <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <Award className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No grade scales</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              Create a grade scale to define how percentages map to grades (e.g., A = 90-100%).
            </p>
            <GradeScaleDialog onSuccess={() => window.location.reload()} />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scales.map((scale) => (
            <Card key={scale.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold truncate pr-2">
                  {scale.name}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <GradeScaleDialog 
                      scale={scale} 
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                      } 
                      onSuccess={() => window.location.reload()}
                    />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(scale.id)}
                      disabled={isDeleting === scale.id}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>{isDeleting === scale.id ? 'Deleting...' : 'Delete'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="mt-4 border rounded-md overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase">
                      <tr>
                        <th className="px-3 py-2 font-medium">Grade</th>
                        <th className="px-3 py-2 font-medium">Range (%)</th>
                        <th className="px-3 py-2 font-medium">GPA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {scale.grades.map((range: any) => (
                        <tr key={range.id || range.grade} className="hover:bg-muted/50 transition-colors">
                          <td className="px-3 py-2 font-semibold">{range.grade}</td>
                          <td className="px-3 py-2">{range.minPercentage} - {range.maxPercentage}</td>
                          <td className="px-3 py-2 text-muted-foreground">{range.gpaValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
