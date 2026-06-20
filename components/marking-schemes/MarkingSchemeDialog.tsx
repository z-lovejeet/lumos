'use client'

import * as React from 'react'
import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { markingSchemeSchema, type MarkingSchemeFormValues } from '@/lib/validators'
import { createMarkingScheme, updateMarkingScheme } from '@/app/(app)/marking-schemes/actions'

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

interface MarkingSchemeDialogProps {
  scheme?: any
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function MarkingSchemeDialog({ scheme, trigger, onSuccess }: MarkingSchemeDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const isEdit = !!scheme

  const form = useForm<MarkingSchemeFormValues>({
    resolver: zodResolver(markingSchemeSchema),
    defaultValues: {
      name: scheme?.name || '',
      components: scheme?.components?.length > 0 
        ? scheme.components 
        : [
            { name: 'Midterm', weight: 30, maxMarks: 100 },
            { name: 'Final', weight: 50, maxMarks: 100 },
            { name: 'Assignment', weight: 20, maxMarks: 100 }
          ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'components',
  })

  const totalWeight = form.watch('components').reduce((sum, c) => sum + (c.weight || 0), 0)

  async function onSubmit(data: MarkingSchemeFormValues) {
    setIsPending(true)
    const formData = new FormData()
    formData.append('data', JSON.stringify(data))

    try {
      const res = isEdit && scheme.id 
        ? await updateMarkingScheme(scheme.id, formData)
        : await createMarkingScheme(formData)

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
        {trigger || <Button>Create Scheme</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Marking Scheme' : 'Create Marking Scheme'}</DialogTitle>
          <DialogDescription>
            Configure how a subject is graded. Total weight must equal 100%.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheme Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Standard Theory (30-50-20)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Components</FormLabel>
                <div className={`text-sm font-semibold ${totalWeight === 100 ? 'text-green-600' : 'text-destructive'}`}>
                  Total Weight: {totalWeight}%
                </div>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-end">
                  <FormField
                    control={form.control}
                    name={`components.${index}.name`}
                    render={({ field: inputField }) => (
                      <FormItem className="flex-1">
                        <FormLabel className={index !== 0 ? 'sr-only' : ''}>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Midterm" {...inputField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`components.${index}.weight`}
                    render={({ field: inputField }) => (
                      <FormItem className="w-24">
                        <FormLabel className={index !== 0 ? 'sr-only' : ''}>Weight %</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
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
                    name={`components.${index}.maxMarks`}
                    render={({ field: inputField }) => (
                      <FormItem className="w-24">
                        <FormLabel className={index !== 0 ? 'sr-only' : ''}>Max Marks</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
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
                    className="shrink-0 text-destructive"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
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
                onClick={() => append({ name: '', weight: 0, maxMarks: 100 })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Component
              </Button>
            </div>

            {form.formState.errors.components?.root && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {form.formState.errors.components.root.message}
              </p>
            )}

            {form.formState.errors.root && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isPending || totalWeight !== 100}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Save changes' : 'Create scheme'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
