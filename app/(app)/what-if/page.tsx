import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import defaultGradeScale from '@/data/default-grade-scale.json';
import { SimulatorClient } from './SimulatorClient';

export const metadata = {
  title: 'What-If Simulator - AcademiQ',
  description: 'Simulate grades and see the impact on your SGPA/CGPA',
};

export default async function WhatIfPage() {
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
        <h2 className="text-3xl font-bold tracking-tight">What-If Simulator</h2>
        <div className="text-muted-foreground mt-4">
          Please set an active semester to use the simulator.
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

  // Calculate current percentages based on marks
  // This uses pure functions, but since we are in server component we can just pass the raw data
  // to the client component to let it calculate.

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">What-If Simulator</h2>
      </div>
      <p className="text-muted-foreground">
        Adjust your predicted grades to see how they impact your SGPA for the current semester ({activeSemester.name}).
      </p>

      <SimulatorClient 
        subjects={subjects} 
        gradeScale={defaultGradeScale as any} 
      />
    </div>
  );
}
