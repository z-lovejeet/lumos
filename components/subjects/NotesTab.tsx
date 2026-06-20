import { EmptyState } from "@/components/shared/EmptyState";
import { FileText } from "lucide-react";

export function NotesTab() {
  return (
    <div className="p-6">
      <EmptyState 
        icon={FileText}
        title="Notes & Study Materials Coming Soon"
        description="Rich text notes, formulas, and revision checklists will be available in Phase 7."
      />
    </div>
  );
}
