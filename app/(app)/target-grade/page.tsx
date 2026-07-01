import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { TargetGradeClient } from '@/components/target-grade/TargetGradeClient';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import defaultGradeScale from '@/data/default-grade-scale.json';

export const metadata = {
  title: 'Target Grade Calculator - Lumos',
  description: 'Simulate required marks to achieve your target grades',
};

export default async function TargetGradePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the active semester and its subjects
  const activeSemester = await prisma.semester.findFirst({
    where: { userId: user.id, status: 'active' },
    include: {
      subjects: {
        include: {
          markingScheme: true,
          marks: true
        }
      }
    }
  });

  // Fetch active grade scale or use default
  const userGradeScale = await prisma.gradeScale.findFirst({
    where: { userId: user.id, isActive: true }
  });

  const gradeScale = userGradeScale ? (userGradeScale.grades as any) : defaultGradeScale;

  if (!activeSemester) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Target Grade Calculator</h2>
        <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">No active semester</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You need an active semester to calculate target grades.
            </p>
            <Link href="/semesters">
              <Button>Go to Semesters</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Only pass subjects that have a marking scheme
  const eligibleSubjects = activeSemester.subjects.filter(s => s.markingScheme !== null);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Target Grade Calculator</h2>
          <p className="text-muted-foreground">
            Simulate your marks to see what you need to achieve your target grades.
          </p>
        </div>
      </div>
      <TargetGradeClient subjects={eligibleSubjects} gradeScale={gradeScale} />
    </div>
  );
}
