'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function upsertMarks(subjectId: string, marksData: { componentName: string, maxMarks: number, obtainedMarks: number | null, examDate: string | null }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Verify subject ownership
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId }
  })

  if (!subject || subject.userId !== user.id) {
    return { success: false, error: 'Subject not found or unauthorized' }
  }

  try {
    // We do this in a transaction
    await prisma.$transaction(async (tx) => {
      for (const mark of marksData) {
        await tx.mark.upsert({
          where: {
            subjectId_componentName: {
              subjectId: subjectId,
              componentName: mark.componentName
            }
          },
          update: {
            maxMarks: mark.maxMarks,
            obtainedMarks: mark.obtainedMarks,
            examDate: mark.examDate ? new Date(mark.examDate) : null,
          },
          create: {
            subjectId: subjectId,
            componentName: mark.componentName,
            maxMarks: mark.maxMarks,
            obtainedMarks: mark.obtainedMarks,
            examDate: mark.examDate ? new Date(mark.examDate) : null,
          }
        })
      }
    })

    revalidatePath('/marks')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to save marks' }
  }
}
