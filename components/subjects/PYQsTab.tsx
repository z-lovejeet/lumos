import { EmptyState } from "@/components/shared/EmptyState";
import { Database } from "lucide-react";

export function PYQsTab() {
  return (
    <div className="p-6">
      <EmptyState 
        icon={Database}
        title="PYQ Analyzer Coming Soon"
        description="Previous Year Questions frequency analysis and tagging will be available in Phase 9."
      />
    </div>
  );
}
