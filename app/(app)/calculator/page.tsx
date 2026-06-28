import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import defaultGradeScale from '@/data/default-grade-scale.json';
import { CalculatorClient } from './CalculatorClient';

export const metadata = {
  title: 'SGPA / CGPA Calculator - Lumos',
  description: 'Calculate your academic performance metrics',
};

export default async function CalculatorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Fetch all semesters for CGPA
  const semesters = await prisma.semester.findMany({
    where: { userId: user.id },
    include: {
      subjects: {
        include: {
          marks: true,
          markingScheme: true
        }
      }
    },
    orderBy: { number: 'asc' }
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">GPA Calculator</h2>
          <p className="text-muted-foreground mt-1">
            Automated calculations based on your marks, with manual overrides.
          </p>
        </div>
      </div>

      <CalculatorClient 
        semesters={semesters} 
        gradeScale={defaultGradeScale as any} 
      />
    </div>
  );
}
