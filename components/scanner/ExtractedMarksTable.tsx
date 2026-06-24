'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ParsedSubject } from '@/lib/ai/transcript-parser';

interface Props {
  initialSubjects: ParsedSubject[];
  onSave: (subjects: ParsedSubject[]) => void;
  onCancel: () => void;
}

export function ExtractedMarksTable({ initialSubjects, onSave, onCancel }: Props) {
  const [subjects, setSubjects] = useState<ParsedSubject[]>(initialSubjects);

  const handleUpdate = (index: number, field: keyof ParsedSubject, value: any) => {
    const updated = [...subjects];
    updated[index] = { ...updated[index], [field]: value };
    setSubjects(updated);
  };

  const handleDelete = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-background">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-2 py-2">Subject Name</th>
              <th className="px-2 py-2 w-24">Credits</th>
              <th className="px-2 py-2 w-24">Grade</th>
              <th className="px-2 py-2 w-16">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {subjects.map((sub, i) => (
              <tr key={i}>
                <td className="p-2">
                  <Input 
                    value={sub.name} 
                    onChange={(e) => handleUpdate(i, 'name', e.target.value)}
                    className="h-8"
                  />
                </td>
                <td className="p-2">
                  <Input 
                    type="number"
                    value={sub.credits || ''} 
                    onChange={(e) => handleUpdate(i, 'credits', parseInt(e.target.value))}
                    className="h-8 w-20"
                  />
                </td>
                <td className="p-2">
                  <Input 
                    value={sub.grade || ''} 
                    onChange={(e) => handleUpdate(i, 'grade', e.target.value.toUpperCase())}
                    className="h-8 w-20 uppercase"
                  />
                </td>
                <td className="p-2">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(i)} className="text-red-500 hover:text-red-600 h-8 px-2">
                    X
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center pt-2">
        <Button variant="outline" size="sm" onClick={() => setSubjects([...subjects, { name: '', credits: 3, grade: '' }])}>
          + Add Row
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onSave(subjects)}>Confirm & Save</Button>
        </div>
      </div>
    </div>
  );
}
