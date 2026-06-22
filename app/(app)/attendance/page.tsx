import { createServerClient } from '../../../../lib/supabase/server';
import prisma from '../../../../lib/prisma';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { CalendarHeatmap } from '@/components/attendance/CalendarHeatmap';
import { AttendanceStats } from '@/components/attendance/AttendanceStats';
import { BufferCalc } from '@/components/attendance/BufferCalc';
import { predictAttendanceBuffer } from '../../../../lib/calculations/attendance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AttendancePage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get active semester
  const semester = await prisma.semester.findFirst({
    where: { userId: user.id, status: 'active' },
    include: {
      subjects: {
        include: {
          attendance: true
        }
      }
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
  const allAttendance: any[] = [];

  const subjectStats = semester.subjects.map(sub => {
    const subTotal = sub.attendance.length;
    const subAttended = sub.attendance.filter(a => a.attended).length;
    
    totalClasses += subTotal;
    attendedClasses += subAttended;

    sub.attendance.forEach(a => {
      allAttendance.push({
        id: a.id,
        classDate: a.classDate.toISOString(),
        attended: a.attended,
        classType: a.classType,
        subjectName: sub.name
      });
    });

    const buffer = predictAttendanceBuffer(subAttended, subTotal, 75);

    return {
      id: sub.id,
      name: sub.name,
      total: subTotal,
      attended: subAttended,
      buffer
    };
  });

  const overallPercent = totalClasses === 0 ? 100 : (attendedClasses / totalClasses) * 100;
  const overallBuffer = predictAttendanceBuffer(attendedClasses, totalClasses, 75);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Attendance Tracker" description="Track your classes and maintain 75% minimum" />

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
        <Card>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <CalendarHeatmap data={allAttendance} />
        </div>
        <div className="col-span-3 space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Subject Breakdowns</CardTitle>
              <CardDescription>Per-subject attendance buffer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectStats.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
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
