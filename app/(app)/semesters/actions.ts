'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { semesterSchema } from '@/lib/validators'
import { z } from 'zod'

// Get all semesters for the current user
export async function getSemesters() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const semesters = await prisma.semester.findMany({
    where: { userId: user.id },
    orderBy: { startDate: 'desc' }
  })

  return { semesters }
}

// Create a new semester
export async function createSemester(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const rawData = {
    name: formData.get('name'),
    startDate: new Date(formData.get('startDate') as string),
    endDate: new Date(formData.get('endDate') as string),
    isActive: formData.get('isActive') === 'on',
  }

  try {
    const validatedData = semesterSchema.parse(rawData)

    // If this is set to active, deactivate all others
    if (validatedData.isActive) {
      await prisma.semester.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false }
      })
    }

    const count = await prisma.semester.count({ where: { userId: user.id } })

    const newSemester = await prisma.semester.create({
      data: {
        userId: user.id,
        number: count + 1,
        name: validatedData.name,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        isActive: validatedData.isActive,
      }
    })

    revalidatePath('/semesters')
    revalidatePath('/dashboard')
    return { success: true, semester: newSemester }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to create semester' }
  }
}

// Update an existing semester
export async function updateSemester(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const rawData = {
    name: formData.get('name'),
    startDate: new Date(formData.get('startDate') as string),
    endDate: new Date(formData.get('endDate') as string),
    isActive: formData.get('isActive') === 'on',
  }

  try {
    const validatedData = semesterSchema.parse(rawData)

    // Verify ownership
    const existing = await prisma.semester.findUnique({ where: { id } })
    if (!existing || existing.userId !== user.id) {
      return { success: false, error: 'Semester not found or unauthorized' }
    }

    // If this is set to active, deactivate all others
    if (validatedData.isActive && !existing.isActive) {
      await prisma.semester.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false }
      })
    }

    const updated = await prisma.semester.update({
      where: { id },
      data: {
        name: validatedData.name,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        isActive: validatedData.isActive,
      }
    })

    revalidatePath('/semesters')
    revalidatePath('/dashboard')
    return { success: true, semester: updated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to update semester' }
  }
}

// Delete a semester
export async function deleteSemester(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  try {
    // Verify ownership
    const existing = await prisma.semester.findUnique({ where: { id } })
    if (!existing || existing.userId !== user.id) {
      return { success: false, error: 'Semester not found or unauthorized' }
    }

    await prisma.semester.delete({ where: { id } })

    revalidatePath('/semesters')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete semester' }
  }
}
