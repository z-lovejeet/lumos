'use client'

import { BookOpen } from 'lucide-react'
import { MarksDialog } from './MarksDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface MarksClientProps {
  subjects: any[]
}

export function MarksClient({ subjects }: MarksClientProps) {
  
  // Calculate percentage for a subject based on entered marks and marking scheme weights
  const calculateProgress = (subject: any) => {
    if (!subject.markingScheme || !subject.markingScheme.components) return { percentage: 0, enteredWeight: 0 }
    
    let earnedWeighted = 0
    let enteredWeight = 0

    subject.markingScheme.components.forEach((comp: any) => {
      const mark = subject.marks?.find((m: any) => m.componentName === comp.name)
      if (mark && mark.obtainedMarks !== null && mark.obtainedMarks !== undefined) {
        const percentageInComp = mark.obtainedMarks / mark.maxMarks
        earnedWeighted += percentageInComp * comp.weight
        enteredWeight += comp.weight
      }
    })

    return {
      percentage: enteredWeight > 0 ? (earnedWeighted / enteredWeight) * 100 : 0,
      enteredWeight,
      earnedWeighted
    }
  }

  return (
    <div className="space-y-4">
      {subjects.length === 0 ? (
        <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No subjects</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              Add subjects to your active semester first before entering marks.
            </p>
            <Link href="/subjects">
              <Button>Manage Subjects</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const progress = calculateProgress(subject)
            const hasScheme = !!subject.markingScheme

            return (
              <Card key={subject.id} className="overflow-hidden">
                <div className="h-2 w-full" style={{ backgroundColor: subject.colorCode || '#3b82f6' }} />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold truncate pr-2">
                        {subject.code}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground truncate">{subject.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {progress.percentage.toFixed(1)}%
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Current Score
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Assessed so far</span>
                        <span className="font-medium">{progress.enteredWeight}% of 100%</span>
                      </div>
                      <Progress value={progress.enteredWeight} className="h-2" />
                    </div>

                    {!hasScheme ? (
                      <div className="text-sm text-destructive border border-destructive/20 bg-destructive/10 p-2 rounded text-center">
                        No Marking Scheme mapped
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                        {subject.markingScheme.components.map((comp: any) => {
                          const mark = subject.marks?.find((m: any) => m.componentName === comp.name)
                          const hasMark = mark && mark.obtainedMarks !== null
                          
                          return (
                            <div key={comp.name} className={`p-2 rounded border ${hasMark ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'}`}>
                              <div className="font-semibold text-xs truncate">{comp.name}</div>
                              <div className="text-xs mt-1">
                                {hasMark ? (
                                  <span className="font-bold">{mark.obtainedMarks} / {mark.maxMarks}</span>
                                ) : (
                                  <span className="text-muted-foreground italic">Pending</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <div className="pt-2">
                      <MarksDialog subject={subject} onSuccess={() => window.location.reload()} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
