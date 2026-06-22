import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Plus, BookOpen, Clock, Tag } from 'lucide-react';
import Link from 'next/link';

export default async function NotesPage() {
  const supabase = await createClient();
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
          notes: {
            orderBy: { updatedAt: 'desc' }
          }
        }
      }
    }
  });

  if (!semester) {
    return (
      <div className="p-8">
        <PageHeader title="Study Notes" description="Organize your academic notes" />
        <Card className="mt-8">
          <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
            No active semester found. Create a semester to start writing notes.
          </CardContent>
        </Card>
      </div>
    );
  }

  // Flatten notes for global view
  const allNotes = semester.subjects.flatMap(s => s.notes.map(n => ({ ...n, subjectName: s.name })))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <PageHeader title="Study Notes" description="Manage notes, formulas, and revision checklists across all subjects" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {semester.subjects.map(sub => (
          <Card key={sub.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="truncate">{sub.name}</CardTitle>
              <CardDescription>{sub.notes.length} notes</CardDescription>
            </CardHeader>
              <Link href={`/notes/${sub.id}`} className={buttonVariants({ variant: "secondary", className: "w-full" })}>
                View Notes
              </Link>
          </Card>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-xl font-semibold tracking-tight">Recent Notes</h3>
        {allNotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No notes yet</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                You haven't written any notes. Select a subject above to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allNotes.slice(0, 6).map(note => (
              <Card key={note.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
                  </div>
                  <CardDescription className="text-xs flex items-center gap-1">
                    <Tag className="h-3 w-3" /> {note.subjectName} • {note.type}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {note.content || "Empty note..."}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" /> Updated {note.updatedAt.toLocaleDateString()}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
