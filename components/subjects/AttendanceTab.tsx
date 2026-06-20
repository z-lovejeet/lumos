import { EmptyState } from "@/components/shared/EmptyState";
import { Calendar } from "lucide-react";

export function AttendanceTab() {
  return (
    <div className="p-6">
      <EmptyState 
        icon={Calendar}
        title="Attendance Tracking Coming Soon"
        description="The attendance calendar, buffer calculator, and heatmap will be available in Phase 7."
      />
    </div>
  );
}
