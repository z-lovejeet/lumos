'use client'

import * as React from 'react'
import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { gradeScaleSchema, type GradeScaleFormValues } from '@/lib/validators'
import { createGradeScale, updateGradeScale } from '@/app/(app)/grade-scales/actions'

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

interface GradeScaleDialogProps {
  scale?: any
  trigger?: React.ReactNode
  onSuccess?: () => void
}

const DEFAULT_RANGES = [
  { grade: 'O', minPercentage: 90, maxPercentage: 100, gpaValue: 10 },
  { grade: 'A+', minPercentage: 80, maxPercentage: 89.99, gpaValue: 9 },
  { grade: 'A', minPercentage: 70, maxPercentage: 79.99, gpaValue: 8 },
  { grade: 'B+', minPercentage: 60, maxPercentage: 69.99, gpaValue: 7 },
  { grade: 'B', minPercentage: 50, maxPercentage: 59.99, gpaValue: 6 },
  { grade: 'C', minPercentage: 40, maxPercentage: 49.99, gpaValue: 5 },
  { grade: 'F', minPercentage: 0, maxPercentage: 39.99, gpaValue: 0 },
]

export function GradeScaleDialog({ scale, trigger, onSuccess }: GradeScaleDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const isEdit = !!scale

  const form = useForm<GradeScaleFormValues>({
    resolver: zodResolver(gradeScaleSchema),
    defaultValues: {
      name: scale?.name || '',
      ranges: scale?.grades?.length > 0 ? scale.grades : DEFAULT_RANGES,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ranges',
  })

  async function onSubmit(data: GradeScaleFormValues) {
    setIsPending(true)
    const formData = new FormData()
    formData.append('data', JSON.stringify(data))

    try {
      const res = isEdit && scale.id 
        ? await updateGradeScale(scale.id, formData)
        : await createGradeScale(formData)

      if (res?.error) {
        form.setError('root', { message: res.error })
      } else {
        setOpen(false)
        form.reset()
        if (onSuccess) onSuccess()
      }
    } catch (error) {
      form.setError('root', { message: 'An unexpected error occurred' })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Create Scale</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Grade Scale' : 'Create Grade Scale'}</DialogTitle>
          <DialogDescription>
            Define how percentages map to grades and GPA points.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scale Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. standard 10-point scale" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Grade Ranges</FormLabel>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-end bg-muted/40 p-2 rounded-md">
                  <FormField
                    control={form.control}
                    name={`ranges.${index}.grade`}
                    render={({ field: inputField }) => (
                      <FormItem className="flex-1">
                        <FormLabel className={index !== 0 ? 'sr-only' : 'text-xs'}>Grade Label</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. A+" {...inputField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`ranges.${index}.minPercentage`}
                    render={({ field: inputField }) => (
                      <FormItem className="w-24">
                        <FormLabel className={index !== 0 ? 'sr-only' : 'text-xs'}>Min %</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" step="0.01" 
                            {...inputField} 
                            onChange={e => inputField.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`ranges.${index}.maxPercentage`}
                    render={({ field: inputField }) => (
                      <FormItem className="w-24">
                        <FormLabel className={index !== 0 ? 'sr-only' : 'text-xs'}>Max %</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" step="0.01"
                            {...inputField} 
                            onChange={e => inputField.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`ranges.${index}.gpaValue`}
                    render={({ field: inputField }) => (
                      <FormItem className="w-24">
                        <FormLabel className={index !== 0 ? 'sr-only' : 'text-xs'}>GPA Pts</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" step="0.01"
                            {...inputField} 
                            onChange={e => inputField.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0 text-destructive mb-0.5"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 2}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ grade: '', minPercentage: 0, maxPercentage: 100, gpaValue: 0 })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Grade Range
              </Button>
            </div>

            {form.formState.errors.ranges?.root && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {form.formState.errors.ranges.root.message}
              </p>
            )}

            {form.formState.errors.root && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Save changes' : 'Create scale'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
