import React from 'react';
import { Users } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';

export interface PresenceBadgeProps {
  count: number;
  label?: string;
  className?: string;
}

/**
 * Molecule PresenceBadge Component
 * Displays live active learners with a green pulsing dot.
 */
export const PresenceBadge: React.FC<PresenceBadgeProps> = ({
  count,
  label = 'siswa aktif belajar',
  className = '',
}) => {
  return (
    <Badge variant="emerald" size="md" dot className={`shadow-sm ${className}`}>
      <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      <span>{count} {label}</span>
    </Badge>
  );
};
