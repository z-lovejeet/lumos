import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, User, Calendar, Trophy } from "lucide-react";

interface SubjectOverviewProps {
  subject: any;
  percentage: number;
  grade: string;
}

export function SubjectOverview({ subject, percentage, grade }: SubjectOverviewProps) {
  // Calculate attendance if available, otherwise default to N/A for Phase 4
  let attendanceStr = 'N/A';
  let attendanceNum = 0;
  
  if (subject.attendance && subject.attendance.length > 0) {
    const total = subject.attendance.length;
    const attended = subject.attendance.filter((a: any) => a.attended).length;
    attendanceNum = (attended / total) * 100;
    attendanceStr = `${attendanceNum.toFixed(1)}%`;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Percentage</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{percentage.toFixed(2)}%</div>
          <Progress value={percentage} className="mt-2 h-2" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Predicted Grade</CardTitle>
          <Trophy className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{grade}</div>
          <p className="text-xs text-muted-foreground mt-1">Based on current marks</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Attendance</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{attendanceStr}</div>
          {attendanceStr !== 'N/A' && <Progress value={attendanceNum} className="mt-2 h-2" />}
          {attendanceStr === 'N/A' && <p className="text-xs text-muted-foreground mt-1">No records yet</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credits</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{subject.credits}</div>
          <p className="text-xs text-muted-foreground mt-1">{subject.category}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Faculty</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold truncate">{subject.facultyName || 'Not Assigned'}</div>
          <p className="text-xs text-muted-foreground mt-1">Course Instructor</p>
        </CardContent>
      </Card>
    </div>
  );
}
