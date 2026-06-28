import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { AttendanceStats } from '@/components/attendance/AttendanceStats';
import { BufferCalc } from '@/components/attendance/BufferCalc';
import { predictAttendanceBuffer } from '@/lib/calculations/attendance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ManualAttendanceManager } from '@/components/attendance/ManualAttendanceManager';

export default async function AttendancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get active semester
  const semester = await prisma.semester.findFirst({
    where: { userId: user.id, status: 'active' },
    include: {
      subjects: true
    }
  });

  if (!semester) {
    return (
      <div className="p-8">
        <PageHeader title="Attendance Tracker" description="Track your class attendance" />
        <Card className="mt-8">
          <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
            No active semester found. Create a semester to start tracking attendance.
          </CardContent>
        </Card>
      </div>
    );
  }

  // Aggregate attendance
  let totalClasses = 0;
  let attendedClasses = 0;
  let totalInSemester = 0;

  const subjectStats = semester.subjects.map(sub => {
    const subTotal = sub.totalClassesConducted || 0;
    const subAttended = sub.totalClassesAttended || 0;
    const subSemester = sub.totalClassesInSemester || 0;
    
    totalClasses += subTotal;
    attendedClasses += subAttended;
    totalInSemester += subSemester;

    const buffer = predictAttendanceBuffer(subAttended, subTotal, subSemester, 75);

    return {
      id: sub.id,
      name: sub.name,
      totalClassesConducted: subTotal,
      totalClassesAttended: subAttended,
      totalClassesInSemester: subSemester,
      total: subTotal,
      attended: subAttended,
      buffer
    };
  });

  const overallPercent = totalClasses === 0 ? 100 : (attendedClasses / totalClasses) * 100;
  const overallBuffer = predictAttendanceBuffer(attendedClasses, totalClasses, totalInSemester, 75);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Attendance Tracker" description="Update your attendance manually and calculate buffers" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AttendanceStats 
          totalClasses={totalClasses} 
          attendedClasses={attendedClasses} 
          percentage={overallPercent} 
        />
        <BufferCalc 
          canMiss={overallBuffer.canMiss} 
          needToAttend={overallBuffer.needToAttend} 
          status={overallBuffer.status} 
        />
        <Card className="bg-card/95 backdrop-blur-xl border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Semester Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{semester.subjects.length} Subjects</div>
            <p className="text-xs text-muted-foreground">
              {subjectStats.filter(s => s.buffer.status === 'safe').length} safe, {subjectStats.filter(s => s.buffer.status !== 'safe').length} need attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <ManualAttendanceManager subjects={subjectStats} />
        </div>
        <div className="lg:col-span-3 space-y-4">
          <Card className="h-full bg-card/95 backdrop-blur-xl border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
            <CardHeader>
              <CardTitle>Subject Breakdowns</CardTitle>
              <CardDescription>Overall 75% attendance buffer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectStats.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{sub.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sub.attended}/{sub.total} classes
                      </p>
                    </div>
                    <div className="text-right">
                      {sub.buffer.status === 'critical' ? (
                        <p className="text-sm font-semibold text-destructive">Attend {sub.buffer.needToAttend}</p>
                      ) : (
                        <p className="text-sm font-semibold text-emerald-500">Miss {sub.buffer.canMiss}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {sub.total === 0 ? 100 : Math.round((sub.attended / sub.total) * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
                {subjectStats.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No subjects added to this semester yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
