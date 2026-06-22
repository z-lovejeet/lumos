import { EmptyState } from "@/components/shared/EmptyState";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NotesTab({ subjectId }: { subjectId?: string }) {
  return (
    <div className="p-6">
      <EmptyState 
        icon={BookOpen}
        title="Subject Notes"
        description="Write and organize notes, formulas, and checklists for this subject."
        action={
          <Button asChild>
            <Link href={subjectId ? `/notes/${subjectId}` : "/notes"}>Open Notes Editor</Link>
          </Button>
        }
      />
    </div>
  );
}
