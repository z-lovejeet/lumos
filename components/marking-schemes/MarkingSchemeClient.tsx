'use client'

import { useState } from 'react'
import { Calculator, MoreVertical, Pencil, Trash } from 'lucide-react'
import { MarkingSchemeDialog } from './MarkingSchemeDialog'
import { deleteMarkingScheme } from '@/app/(app)/marking-schemes/actions'

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

interface MarkingSchemeClientProps {
  initialSchemes: any[]
}

export function MarkingSchemeClient({ initialSchemes }: MarkingSchemeClientProps) {
  const [schemes, setSchemes] = useState(initialSchemes)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingScheme, setEditingScheme] = useState<any | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this marking scheme? Subjects using it will lose their grading structure.")) {
      return
    }
    
    setIsDeleting(id)
    try {
      await deleteMarkingScheme(id)
      setSchemes(prev => prev.filter(s => s.id !== id))
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <MarkingSchemeDialog onSuccess={() => window.location.reload()} />
      </div>

      {editingScheme && (
        <MarkingSchemeDialog 
          scheme={editingScheme} 
          open={true} 
          onOpenChange={(open) => {
            if (!open) setEditingScheme(null)
          }} 
          onSuccess={() => {
            setEditingScheme(null)
            window.location.reload()
          }}
        />
      )}

      {schemes.length === 0 ? (
        <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <Calculator className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No marking schemes</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              Create a marking scheme to define how your subjects are graded (e.g., Midterm + Final).
            </p>
            <MarkingSchemeDialog onSuccess={() => window.location.reload()} />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schemes.map((scheme) => (
            <Card key={scheme.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold truncate pr-2">
                  {scheme.name}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  } />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => setEditingScheme(scheme)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(scheme.id)}
                      disabled={isDeleting === scheme.id}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>{isDeleting === scheme.id ? 'Deleting...' : 'Delete'}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-2">
                  {scheme.components.map((comp: any) => (
                    <div key={comp.id} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{comp.name}</span>
                      <div className="text-muted-foreground flex items-center gap-2">
                        <span>{comp.weight}%</span>
                        <span>({comp.maxMarks} marks)</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t flex justify-between items-center font-bold text-sm">
                    <span>Total</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
