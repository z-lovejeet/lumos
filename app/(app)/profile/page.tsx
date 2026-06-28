import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ProfileClient } from './ProfileClient';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect('/login');
  }

  // Fetch full user record from database
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    include: {
      semesters: true,
      achievements: true,
    }
  });

  if (!dbUser) {
    redirect('/login');
  }

  // Calculate some stats
  const totalSemesters = dbUser.semesters.length;
  const totalCredits = dbUser.semesters.reduce((acc, sem) => acc + sem.totalCredits, 0);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
          <p className="text-muted-foreground">
            Manage your academic identity and account settings.
          </p>
        </div>
      </div>

      <ProfileClient 
        user={dbUser} 
        stats={{ totalSemesters, totalCredits }} 
      />
    </div>
  );
}
