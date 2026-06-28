import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import defaultGradeScale from '@/data/default-grade-scale.json';
import { PredictionsClient } from './PredictionsClient';

export const metadata = {
  title: 'Grade Predictions - Lumos',
  description: 'AI-powered grade predictions for your subjects',
};

export default async function PredictionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Fetch active semester
  const activeSemester = await prisma.semester.findFirst({
    where: { userId: user.id, status: 'active' },
  });

  if (!activeSemester) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Grade Predictions</h2>
        <div className="text-muted-foreground mt-4">
          Please set an active semester to view grade predictions.
        </div>
      </div>
    );
  }

  // Fetch subjects with marks and schemes
  const subjects = await prisma.subject.findMany({
    where: { semesterId: activeSemester.id },
    include: {
      marks: true,
      markingScheme: true,
    },
    orderBy: { code: 'asc' }
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Grade Predictions</h2>
          <p className="text-muted-foreground mt-1">
            Based on your current performance in {activeSemester.name}
          </p>
        </div>
      </div>

      <PredictionsClient 
        subjects={subjects} 
        gradeScale={defaultGradeScale as any} 
      />
    </div>
  );
}
