'use client'

import * as React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { subjectSchema, type SubjectFormValues } from '@/lib/validators'
import { createSubject, updateSubject } from '@/app/(app)/subjects/actions'
import { useAcademicStore } from '@/stores/academic-store'

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SubjectDialogProps {
  subject?: any
  semesters: any[]
  markingSchemes?: any[]
  trigger?: React.ReactElement
  onSuccess?: () => void
}

const CATEGORIES = ['Core', 'Elective', 'Lab', 'Project', 'General']

export function SubjectDialog({ subject, semesters, markingSchemes = [], trigger, onSuccess }: SubjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const { activeSemesterId } = useAcademicStore()
  const isEdit = !!subject

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      semesterId: subject?.semesterId || activeSemesterId || (semesters[0]?.id ?? ''),
      markingSchemeId: subject?.markingSchemeId || '',
      code: subject?.code || '',
      name: subject?.name || '',
      credits: subject?.credits || 3,
      category: subject?.category || 'Core',
      facultyName: subject?.facultyName || '',
      colorCode: subject?.colorCode || '#3b82f6', // default blue
    },
  })

  async function onSubmit(data: z.infer<typeof subjectSchema>) {
    setIsPending(true)
    const formData = new FormData()
    formData.append('semesterId', data.semesterId)
    if (data.markingSchemeId) formData.append('markingSchemeId', data.markingSchemeId)
    formData.append('code', data.code)
    formData.append('name', data.name)
    formData.append('credits', data.credits.toString())
    formData.append('category', data.category)
    if (data.facultyName) formData.append('facultyName', data.facultyName)
    if (data.colorCode) formData.append('colorCode', data.colorCode)

    try {
      const res = isEdit && subject.id 
        ? await updateSubject(subject.id, formData)
        : await createSubject(formData)

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
      {/* @ts-ignore - Base UI nativeButton prop to prevent non-button errors */}
      <DialogTrigger render={trigger || <Button>Add Subject</Button>} nativeButton={trigger ? false : true} />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update course details.' : 'Add a new subject to a semester.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="semesterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a semester">
                          {field.value ? semesters.find(s => s.id === field.value)?.name : null}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {semesters.map(sem => (
                        <SelectItem key={sem.id} value={sem.id}>{sem.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="markingSchemeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marking Scheme (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a marking scheme">
                          {field.value ? markingSchemes.find(m => m.id === field.value)?.name : null}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {markingSchemes.map(ms => (
                        <SelectItem key={ms.id} value={ms.id}>{ms.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CS101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credits</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Intro to Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category">
                            {field.value || null}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="colorCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input type="color" {...field} className="w-12 h-10 p-1 cursor-pointer" />
                        <span className="text-sm text-muted-foreground uppercase">{field.value}</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="facultyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Prof. Alan Turing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isPending || semesters.length === 0}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Save changes' : 'Add subject'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
