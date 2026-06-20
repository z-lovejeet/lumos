'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { subjectSchema } from '@/lib/validators'
import { z } from 'zod'

export async function getSubjects() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // We need to fetch subjects along with the semester name to display it if needed
  const subjects = await prisma.subject.findMany({
    where: { userId: user.id },
    include: {
      semester: {
        select: { name: true }
      }
    },
    orderBy: { code: 'asc' }
  })

  return { subjects }
}

export async function createSubject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const rawData = {
    semesterId: formData.get('semesterId'),
    code: formData.get('code'),
    name: formData.get('name'),
    credits: parseFloat(formData.get('credits') as string),
    category: formData.get('category'),
    facultyName: formData.get('facultyName') || undefined,
    colorCode: formData.get('colorCode') || undefined,
    markingSchemeId: formData.get('markingSchemeId') || undefined,
  }

  try {
    const validatedData = subjectSchema.parse(rawData)

    // Verify semester ownership
    const semester = await prisma.semester.findUnique({
      where: { id: validatedData.semesterId }
    })
    
    if (!semester || semester.userId !== user.id) {
      return { success: false, error: 'Invalid semester' }
    }

    let components: any[] = []
    if (validatedData.markingSchemeId) {
      const scheme = await prisma.markingScheme.findUnique({
        where: { id: validatedData.markingSchemeId }
      })
      if (scheme && scheme.components) {
        components = scheme.components as any[]
      }
    }

    const newSubject = await prisma.subject.create({
      data: {
        userId: user.id,
        semesterId: validatedData.semesterId,
        code: validatedData.code,
        name: validatedData.name,
        credits: validatedData.credits,
        category: validatedData.category,
        facultyName: validatedData.facultyName,
        markingSchemeId: validatedData.markingSchemeId,
        marks: {
          create: components.map((comp) => ({
            componentName: comp.name,
            maxMarks: comp.maxMarks,
            obtainedMarks: null,
          }))
        }
      }
    })

    revalidatePath('/subjects')
    revalidatePath('/dashboard')
    return { success: true, subject: newSubject }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: 'Failed to create subject' }
  }
}

export async function updateSubject(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const rawData = {
    semesterId: formData.get('semesterId'),
    code: formData.get('code'),
    name: formData.get('name'),
    credits: parseFloat(formData.get('credits') as string),
    category: formData.get('category'),
    facultyName: formData.get('facultyName') || undefined,
    colorCode: formData.get('colorCode') || undefined,
    markingSchemeId: formData.get('markingSchemeId') || undefined,
  }

  try {
    const validatedData = subjectSchema.parse(rawData)

    // Verify subject ownership
    const existing = await prisma.subject.findUnique({ where: { id } })
    if (!existing || existing.userId !== user.id) {
      return { success: false, error: 'Subject not found or unauthorized' }
    }

    const updated = await prisma.subject.update({
      where: { id },
      data: {
        semesterId: validatedData.semesterId,
        code: validatedData.code,
        name: validatedData.name,
        credits: validatedData.credits,
        category: validatedData.category,
        facultyName: validatedData.facultyName,
        markingSchemeId: validatedData.markingSchemeId,
      }
    })

    revalidatePath('/subjects')
    revalidatePath('/dashboard')
    return { success: true, subject: updated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: 'Failed to update subject' }
  }
}

export async function deleteSubject(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  try {
    const existing = await prisma.subject.findUnique({ where: { id } })
    if (!existing || existing.userId !== user.id) {
      return { success: false, error: 'Subject not found or unauthorized' }
    }

    await prisma.subject.delete({ where: { id } })

    revalidatePath('/subjects')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete subject' }
  }
}
