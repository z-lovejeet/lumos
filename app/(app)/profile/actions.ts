'use server';

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long').optional().or(z.literal('')),
  university: z.string().max(100, 'University name is too long').optional().or(z.literal('')),
  major: z.string().max(100, 'Major name is too long').optional().or(z.literal('')),
  graduationYear: z.coerce.number().min(2000, 'Invalid year').max(2100, 'Invalid year').optional().or(z.literal('')).transform(v => v === '' ? null : Number(v)),
  bio: z.string().max(500, 'Bio is too long').optional().or(z.literal('')),
});

export async function updateProfile(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return { error: 'Unauthorized. Please log in.' };
    }

    const rawData = {
      name: formData.get('name'),
      university: formData.get('university'),
      major: formData.get('major'),
      graduationYear: formData.get('graduationYear'),
      bio: formData.get('bio'),
    };

    const validatedData = updateProfileSchema.safeParse(rawData);

    if (!validatedData.success) {
      return { error: validatedData.error.issues[0].message };
    }

    const dataToUpdate: any = {
      ...(validatedData.data.name ? { name: validatedData.data.name } : {}),
      university: validatedData.data.university || null,
      major: validatedData.data.major || null,
      graduationYear: validatedData.data.graduationYear || null,
      bio: validatedData.data.bio || null,
    };

    await prisma.user.update({
      where: { email: user.email },
      data: dataToUpdate,
    });

    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { error: 'Failed to update profile. Please try again.' };
  }
}

export async function saveCGPA(cgpa: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return { error: 'Unauthorized. Please log in.' };
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { settings: true }
    });

    if (!dbUser) return { error: 'User not found' };

    const settings = typeof dbUser.settings === 'object' && dbUser.settings !== null 
      ? dbUser.settings 
      : {};

    await prisma.user.update({
      where: { email: user.email },
      data: {
        settings: {
          ...(settings as any),
          savedCGPA: cgpa
        }
      }
    });

    revalidatePath('/calculator');
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to save CGPA:', error);
    return { error: 'Failed to save CGPA. Please try again.' };
  }
}
export async function saveSGPA(sgpa: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return { error: 'Unauthorized. Please log in.' };
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { settings: true }
    });

    if (!dbUser) return { error: 'User not found' };

    const settings = typeof dbUser.settings === 'object' && dbUser.settings !== null 
      ? dbUser.settings 
      : {};

    await prisma.user.update({
      where: { email: user.email },
      data: {
        settings: {
          ...(settings as any),
          savedSGPA: sgpa
        }
      }
    });

    revalidatePath('/calculator');
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to save SGPA:', error);
    return { error: 'Failed to save SGPA. Please try again.' };
  }
}
