'use client'

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { Subject, Mark, MarkingScheme } from '@prisma/client'
import { calculateSubjectPercentage } from '@/lib/calculations/percentage'
import { getGradeFromPercentage, GradeRange } from '@/lib/calculations/sgpa'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

interface MarksTableProps {
  subject: Subject & {
    marks: Mark[]
    markingScheme: MarkingScheme | null
  }
  gradeScaleRanges?: GradeRange[]
}

interface ComponentMark {
  componentName: string
  maxMarks: number
  weight: number
  obtainedMarks: number | null
  examDate: string | null
}

export function MarksTable({ subject, gradeScaleRanges = [] }: MarksTableProps) {
  const [marksState, setMarksState] = useState<ComponentMark[]>([])
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Initialize state based on marking scheme and existing marks
  useEffect(() => {
    if (subject.markingScheme) {
      const components = subject.markingScheme.components as Array<{ name: string, maxMarks: number, weight: number }>
      const initialMarks = components.map(c => {
        const existingMark = subject.marks.find(m => m.componentName === c.name)
        return {
          componentName: c.name,
          maxMarks: c.maxMarks,
          weight: c.weight,
          obtainedMarks: existingMark ? existingMark.obtainedMarks : null,
          examDate: existingMark?.examDate ? new Date(existingMark.examDate).toISOString().split('T')[0] : null
        }
      })
      setMarksState(initialMarks)
    }
  }, [subject])

  const saveMarks = async (marksToSave: ComponentMark[]) => {
    setStatus('saving')
    try {
      const res = await fetch(`/api/subjects/${subject.id}/marks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marks: marksToSave }),
      })
      
      if (!res.ok) throw new Error('Failed to save marks')
      
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'Error saving marks')
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(debounce(saveMarks, 1000), [subject.id])

  const handleMarkChange = (index: number, value: string) => {
    const numValue = value === '' ? null : parseFloat(value)
    
    setMarksState(prev => {
      const newState = [...prev]
      if (numValue !== null && numValue > newState[index].maxMarks) {
        newState[index].obtainedMarks = newState[index].maxMarks // cap at max marks
      } else {
        newState[index].obtainedMarks = numValue
      }
      
      debouncedSave(newState)
      return newState
    })
    setStatus('saving')
  }

  if (!subject.markingScheme) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No marking scheme assigned to this subject.</p>
        <p className="text-sm mt-2">Edit the subject to assign a marking scheme.</p>
      </div>
    )
  }

  const components = subject.markingScheme.components as any[]
  const totalWeightedObtained = calculateSubjectPercentage(marksState, components)
  const predictedGrade = getGradeFromPercentage(totalWeightedObtained, gradeScaleRanges)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Evaluation Components</h3>
        <div className="flex items-center gap-2 text-sm">
          {status === 'saving' && <span className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</span>}
          {status === 'saved' && <span className="flex items-center text-green-600 dark:text-green-400"><CheckCircle2 className="mr-2 h-4 w-4" /> Saved</span>}
          {status === 'error' && <span className="flex items-center text-destructive"><AlertCircle className="mr-2 h-4 w-4" /> {errorMsg}</span>}
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Component</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Max Marks</TableHead>
              <TableHead>Obtained Marks</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marksState.map((mark, idx) => {
              const score = mark.obtainedMarks !== null 
                ? ((mark.obtainedMarks / mark.maxMarks) * mark.weight).toFixed(1) 
                : '-'
              
              return (
                <TableRow key={mark.componentName}>
                  <TableCell className="font-medium">{mark.componentName}</TableCell>
                  <TableCell>{mark.weight}%</TableCell>
                  <TableCell>{mark.maxMarks}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={mark.maxMarks}
                        step="0.5"
                        className="w-24"
                        value={mark.obtainedMarks ?? ''}
                        onChange={(e) => handleMarkChange(idx, e.target.value)}
                      />
                      <span className="text-sm text-muted-foreground">/ {mark.maxMarks}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {score} {score !== '-' && '%'}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Current Total</p>
          <p className="text-3xl font-bold">{totalWeightedObtained.toFixed(1)}%</p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm font-medium text-muted-foreground">Predicted Grade</p>
          <div className="flex items-center sm:justify-end gap-2 mt-1">
            <span className="text-2xl font-bold text-primary">{predictedGrade}</span>
            <Badge variant={totalWeightedObtained >= 40 ? "default" : "destructive"}>
              {totalWeightedObtained >= 40 ? 'Passing' : 'Needs Improvement'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
