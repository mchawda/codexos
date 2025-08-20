'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface NotesPanelProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onClose: () => void;
}

export default function NotesPanel({ notes, onNotesChange, onClose }: NotesPanelProps) {
  return (
    <div className="absolute top-16 right-4 w-80 bg-background border rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Scenario Notes</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4">
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add notes about this scenario..."
          className="min-h-[200px] resize-none"
        />
      </div>
    </div>
  );
}
