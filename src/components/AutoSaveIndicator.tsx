import React from 'react';
import { CheckCircle2, CloudOff } from 'lucide-react';
import { format } from 'date-fns';

interface AutoSaveProps {
  status: 'saved' | 'saving' | 'error' | 'idle';
  lastSaved?: Date;
}

export function AutoSaveIndicator({ status, lastSaved }: AutoSaveProps) {
  if (status === 'idle' && !lastSaved) return null;

  return (
    <div className="flex items-center gap-1.5 text-[10px] font-medium transition-opacity duration-300">
      {status === 'saving' && (
        <>
          <div className="h-2 w-2 rounded-full border border-stone-500 border-t-transparent animate-spin"></div>
          <span className="text-stone-500">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          <span className="text-stone-500">Saved {lastSaved && format(lastSaved, 'h:mm a')}</span>
        </>
      )}
      {status === 'error' && (
        <>
          <CloudOff className="h-3 w-3 text-red-500" />
          <span className="text-red-500">Save Failed</span>
        </>
      )}
    </div>
  );
}
