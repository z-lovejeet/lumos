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
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
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

const CATEGORIES = ['Core', 'Elective', 'Lab', 'Project', 'General']

interface SubjectFormProps {
  subject?: any
  semesters: any[]
  markingSchemes?: any[]
  onSuccess?: () => void
  onCancel?: () => void
}

export function SubjectForm({ subject, semesters, markingSchemes = [], onSuccess, onCancel }: SubjectFormProps) {
  const [isPending, setIsPending] = useState(false)
  const { activeSemesterId } = useAcademicStore()
  const router = useRouter()
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

    try {
      const res = isEdit && subject.id 
        ? await updateSubject(subject.id, formData)
        : await createSubject(formData)

      if (res?.error) {
        form.setError('root', { message: res.error })
      } else {
        form.reset()
        if (onSuccess) onSuccess()
        else {
          router.push('/subjects')
          router.refresh()
        }
      }
    } catch (error) {
      form.setError('root', { message: 'An unexpected error occurred' })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="semesterId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a semester" />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a marking scheme" />
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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
            name="facultyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Faculty Name (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Dr. Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {form.formState.errors.root && (
          <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
        )}

        <div className="flex gap-4 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Subject'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
