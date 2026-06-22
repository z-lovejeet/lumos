import { EmptyState } from "@/components/shared/EmptyState";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function AttendanceTab({ subjectId }: { subjectId?: string }) {
  return (
    <div className="p-6">
      <EmptyState 
        icon={Calendar}
        title="Attendance Tracker"
        description="Manage your attendance across all subjects in the global dashboard."
        actionLabel="Go to Attendance Dashboard"
        actionHref="/attendance"
      />
    </div>
  );
}
