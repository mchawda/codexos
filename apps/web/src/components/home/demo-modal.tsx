'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface DemoModalProps {
  children: React.ReactNode;
}

export default function DemoModal({ children }: DemoModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            CodexOS Demo
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center p-4">
          <div className="relative w-full max-w-3xl">
            <img
              src="/demo.gif"
              alt="CodexOS Demo"
              className="w-full h-auto rounded-lg shadow-lg"
              style={{ maxHeight: '70vh' }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
