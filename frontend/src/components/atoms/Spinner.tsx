import React from 'react';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'emerald' | 'blue' | 'slate' | 'white';
}

/**
 * Atomic Spinner Component
 * Smooth loading indicator.
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  color = 'emerald',
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorStyles = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    blue: 'text-blue-600 dark:text-blue-400',
    slate: 'text-slate-600 dark:text-slate-400',
    white: 'text-white',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin ${sizeStyles[size]} ${colorStyles[color]}`} />
    </div>
  );
};
