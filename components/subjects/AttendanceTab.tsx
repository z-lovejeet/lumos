import { EmptyState } from "@/components/shared/EmptyState";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AttendanceTab({ subjectId }: { subjectId?: string }) {
  return (
    <div className="p-6">
      <EmptyState 
        icon={Calendar}
        title="Attendance Tracker"
        description="Manage your attendance across all subjects in the global dashboard."
        action={
          <Button asChild>
            <Link href="/attendance">Go to Attendance Dashboard</Link>
          </Button>
        }
      />
    </div>
  );
}
