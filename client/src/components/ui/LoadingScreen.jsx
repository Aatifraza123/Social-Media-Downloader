import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
        <span className="text-xs text-zinc-500 font-medium">Loading session...</span>
      </div>
    </div>
  );
}
