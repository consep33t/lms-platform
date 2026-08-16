import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'success'
    | 'warning'
    | 'info'
    | 'emerald'
    | 'blue'
    | 'indigo'
    | 'amber'
    | 'rose'
    | 'slate'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

/**
 * Unified Atomic Badge Component
 * Used for status pills, role tags, level indicators, and difficulty badges.
 */
export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-0.5 text-xs gap-1.5',
    lg: 'px-3 py-1 text-sm gap-2',
  }

  const variantStyles = {
    default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
    outline: 'text-foreground border border-input bg-background',
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    info: 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    indigo: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400',
    slate: 'border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400',
  }

  const dotColorStyles = {
    default: 'bg-primary-foreground',
    secondary: 'bg-secondary-foreground',
    destructive: 'bg-destructive-foreground',
    outline: 'bg-foreground',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-500',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', dotColorStyles[variant])} />}
      <span>{children}</span>
    </div>
  )
}
