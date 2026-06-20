'use client'

import * as React from 'react'
import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { upsertMarks } from '@/app/(app)/marks/actions'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface MarksDialogProps {
  subject: any
  trigger?: React.ReactElement
  onSuccess?: () => void
}

// Generate schema dynamically based on components? Actually we can just use a generic array schema
const marksFormSchema = z.object({
  marks: z.array(z.object({
    componentName: z.string(),
    maxMarks: z.number(),
    obtainedMarks: z.number().nullable(),
    examDate: z.string().optional()
  }))
})

type MarksFormValues = z.infer<typeof marksFormSchema>

export function MarksDialog({ subject, trigger, onSuccess }: MarksDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  // Merge marking scheme components with existing marks
  const schemeComponents = subject.markingScheme?.components || []
  
  const defaultMarks = schemeComponents.map((comp: any) => {
    const existingMark = subject.marks?.find((m: any) => m.componentName === comp.name)
    return {
      componentName: comp.name,
      maxMarks: comp.maxMarks || 100,
      obtainedMarks: existingMark?.obtainedMarks ?? null,
      examDate: existingMark?.examDate ? new Date(existingMark.examDate).toISOString().split('T')[0] : ''
    }
  })

  const form = useForm<MarksFormValues>({
    resolver: zodResolver(marksFormSchema),
    defaultValues: {
      marks: defaultMarks
    },
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: 'marks',
  })

  async function onSubmit(data: MarksFormValues) {
    setIsPending(true)
    
    // Convert nulls and empty strings correctly
    const cleanData = data.marks.map(m => ({
      ...m,
      obtainedMarks: isNaN(m.obtainedMarks as any) || m.obtainedMarks === null ? null : Number(m.obtainedMarks),
      examDate: m.examDate || null
    }))

    try {
      const res = await upsertMarks(subject.id, cleanData)

      if (res?.error) {
        form.setError('root', { message: res.error })
      } else {
        setOpen(false)
        if (onSuccess) onSuccess()
      }
    } catch (error) {
      form.setError('root', { message: 'An unexpected error occurred' })
    } finally {
      setIsPending(false)
    }
  }

  // Handle dialog opening to reset form state in case external data changed
  React.useEffect(() => {
    if (open) {
      form.reset({ marks: defaultMarks })
    }
  }, [open, subject])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger || <Button variant="outline" size="sm">Enter Marks</Button>} />
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enter Marks: {subject.name}</DialogTitle>
          <DialogDescription>
            {subject.markingScheme 
              ? `Scheme: ${subject.markingScheme.name}` 
              : 'No marking scheme attached to this subject!'}
          </DialogDescription>
        </DialogHeader>

        {!subject.markingScheme || schemeComponents.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            Please attach a Marking Scheme to this subject first to enter marks.
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                {fields.map((field, index) => {
                  const compConfig = schemeComponents.find((c: any) => c.name === field.componentName)
                  const weight = compConfig?.weight || 0

                  return (
                    <div key={field.id} className="flex gap-4 items-center bg-muted/30 p-3 rounded-lg border">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{field.componentName}</div>
                        <div className="text-xs text-muted-foreground">Weight: {weight}% | Max: {field.maxMarks}</div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name={`marks.${index}.obtainedMarks`}
                        render={({ field: inputField }) => (
                          <FormItem className="w-24">
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.5"
                                placeholder="Marks"
                                value={inputField.value ?? ''}
                                onChange={e => {
                                  const val = e.target.value === '' ? null : parseFloat(e.target.value)
                                  inputField.onChange(val)
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`marks.${index}.examDate`}
                        render={({ field: inputField }) => (
                          <FormItem className="w-32">
                            <FormControl>
                              <Input 
                                type="date"
                                {...inputField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )
                })}
              </div>

              {form.formState.errors.root && (
                <p className="text-[0.8rem] font-medium text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}

              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Marks
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
