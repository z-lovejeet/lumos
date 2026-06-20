'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { markingSchemeSchema } from '@/lib/validators'
import { z } from 'zod'

export async function getMarkingSchemes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const schemes = await prisma.markingScheme.findMany({
    where: { userId: user.id },
    include: {
      components: {
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return { schemes }
}

export async function createMarkingScheme(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  try {
    const rawDataStr = formData.get('data') as string
    if (!rawDataStr) throw new Error('Missing data')
    
    const rawData = JSON.parse(rawDataStr)
    const validatedData = markingSchemeSchema.parse(rawData)

    const newScheme = await prisma.markingScheme.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        components: validatedData.components
      }
    })

    revalidatePath('/marking-schemes')
    revalidatePath('/subjects')
    return { success: true, scheme: newScheme }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to create marking scheme' }
  }
}

export async function updateMarkingScheme(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  try {
    const rawDataStr = formData.get('data') as string
    if (!rawDataStr) throw new Error('Missing data')
      
    const rawData = JSON.parse(rawDataStr)
    const validatedData = markingSchemeSchema.parse(rawData)

    const existing = await prisma.markingScheme.findUnique({ where: { id } })
    if (!existing || existing.userId !== user.id) {
      return { success: false, error: 'Scheme not found or unauthorized' }
    }

    const updated = await prisma.markingScheme.update({
      where: { id },
      data: {
        name: validatedData.name,
        components: validatedData.components
      }
    })

    revalidatePath('/marking-schemes')
    revalidatePath('/subjects')
    return { success: true, scheme: updated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Failed to update marking scheme' }
  }
}

export async function deleteMarkingScheme(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  try {
    const existing = await prisma.markingScheme.findUnique({ where: { id } })
    if (!existing || existing.userId !== user.id) {
      return { success: false, error: 'Scheme not found or unauthorized' }
    }

    // Foreign key actions (CASCADE) will delete the components
    await prisma.markingScheme.delete({ where: { id } })

    revalidatePath('/marking-schemes')
    revalidatePath('/subjects')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete marking scheme' }
  }
}
