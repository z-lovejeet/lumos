'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { gradeScaleSchema } from '@/lib/validators'
import { z } from 'zod'

export async function getGradeScales() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const scales = await prisma.gradeScale.findMany({
    where: { userId: user.id },
    include: {
      ranges: {
        orderBy: { minPercentage: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return { scales }
}

export async function createGradeScale(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  try {
    const rawDataStr = formData.get('data') as string
    if (!rawDataStr) throw new Error('Missing data')
    
    const rawData = JSON.parse(rawDataStr)
    const validatedData = gradeScaleSchema.parse(rawData)

    const newScale = await prisma.gradeScale.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        ranges: {
          create: validatedData.ranges.map((r) => ({
            grade: r.grade,
            minPercentage: r.minPercentage,
            maxPercentage: r.maxPercentage,
            gpaValue: r.gpaValue,
          }))
        }
      },
      include: {
        ranges: true
      }
    })

    revalidatePath('/grade-scales')
    return { success: true, scale: newScale }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to create grade scale' }
  }
}

export async function updateGradeScale(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  try {
    const rawDataStr = formData.get('data') as string
    if (!rawDataStr) throw new Error('Missing data')
      
    const rawData = JSON.parse(rawDataStr)
    const validatedData = gradeScaleSchema.parse(rawData)

    const existing = await prisma.gradeScale.findUnique({ where: { id } })
    if (!existing || existing.userId !== user.id) {
      return { success: false, error: 'Scale not found or unauthorized' }
    }

    // Replace all children
    await prisma.gradeRange.deleteMany({
      where: { scaleId: id }
    })

    const updated = await prisma.gradeScale.update({
      where: { id },
      data: {
        name: validatedData.name,
        ranges: {
          create: validatedData.ranges.map((r) => ({
            grade: r.grade,
            minPercentage: r.minPercentage,
            maxPercentage: r.maxPercentage,
            gpaValue: r.gpaValue,
          }))
        }
      },
      include: {
        ranges: true
      }
    })

    revalidatePath('/grade-scales')
    return { success: true, scale: updated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to update grade scale' }
  }
}

export async function deleteGradeScale(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  try {
    const existing = await prisma.gradeScale.findUnique({ where: { id } })
    if (!existing || existing.userId !== user.id) {
      return { success: false, error: 'Scale not found or unauthorized' }
    }

    await prisma.gradeScale.delete({ where: { id } })

    revalidatePath('/grade-scales')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete grade scale' }
  }
}
