import React from 'react';
import { Users } from 'lucide-react';

interface ActiveLearnerPresenceProps {
  count: number;
}

export const ActiveLearnerPresence: React.FC<ActiveLearnerPresenceProps> = ({ count }) => {
  return (
    <div 
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium cursor-default"
      title={`${count} pelajar sedang aktif`}
    >
      <div className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
      </div>
      <Users className="h-4 w-4" />
      <span>{count}</span>
    </div>
  );
};
