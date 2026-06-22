'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ArrowLeft, Save, Trash2 } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  type: string;
  subjectId: string;
}

export default function SubjectNotesPage() {
  const { subjectId } = useParams();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, [subjectId]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes?subjectId=${subjectId}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
        if (data.length > 0) setActiveNote(data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Note',
          content: '',
          subjectId,
          type: 'note'
        })
      });
      if (res.ok) {
        const newNote = await res.json();
        setNotes([newNote, ...notes]);
        setActiveNote(newNote);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveNote = async () => {
    if (!activeNote) return;
    try {
      await fetch(`/api/notes/${activeNote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeNote.title,
          content: activeNote.content
        })
      });
      // Update local state
      setNotes(notes.map(n => n.id === activeNote.id ? activeNote : n));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      const newNotes = notes.filter(n => n.id !== id);
      setNotes(newNotes);
      if (activeNote?.id === id) {
        setActiveNote(newNotes.length > 0 ? newNotes[0] : null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/notes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader title="Subject Notes" description="Manage notes for this subject" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Sidebar */}
        <Card className="col-span-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notes List</h3>
            <Button size="icon" variant="ghost" onClick={createNote}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading...</p>
            ) : notes.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">No notes found.</p>
            ) : (
              notes.map(n => (
                <div 
                  key={n.id}
                  onClick={() => setActiveNote(n)}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${activeNote?.id === n.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'}`}
                >
                  <p className="font-medium text-sm truncate">{n.title || "Untitled"}</p>
                  <p className="text-xs text-muted-foreground truncate">{n.content || "Empty..."}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Editor */}
        <Card className="col-span-1 md:col-span-3 flex flex-col overflow-hidden">
          {activeNote ? (
            <>
              <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                <Input 
                  value={activeNote.title} 
                  onChange={e => setActiveNote({...activeNote, title: e.target.value})}
                  className="font-semibold text-lg border-none shadow-none focus-visible:ring-0 bg-transparent px-0 w-full max-w-sm"
                  placeholder="Note Title"
                />
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={saveNote}>
                    <Save className="h-4 w-4 mr-2" /> Save
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => deleteNote(activeNote.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 p-0">
                <Textarea 
                  value={activeNote.content}
                  onChange={e => setActiveNote({...activeNote, content: e.target.value})}
                  className="w-full h-full p-4 border-0 rounded-none focus-visible:ring-0 resize-none font-mono text-sm"
                  placeholder="Start typing your notes here..."
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select or create a note to start editing.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
