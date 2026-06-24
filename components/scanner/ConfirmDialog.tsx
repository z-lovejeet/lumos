import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (semester: number) => void;
  subjectCount: number;
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, subjectCount }: ConfirmDialogProps) {
  const [semester, setSemester] = useState<number>(1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Import</DialogTitle>
          <DialogDescription>
            You are about to save {subjectCount} subjects to your academic record. Which semester do these belong to?
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <label htmlFor="semester" className="font-medium text-sm">Semester Number:</label>
          <Input
            id="semester"
            type="number"
            min={1}
            max={10}
            value={semester}
            onChange={(e) => setSemester(parseInt(e.target.value) || 1)}
            className="w-24"
          />
        </div>
        <DialogFooter className="sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => onConfirm(semester)}>
            Save to Database
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
