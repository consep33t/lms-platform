import React from 'react'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
  className?: string
}

/**
 * Molecule StatCard Component
 * Dashboard metric summary card adhering to dynamic theme tokens.
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  className = '',
}) => {
  return (
    <div className={cn('p-5 bg-card border border-border text-card-foreground rounded-xl shadow-sm flex items-center justify-between transition-all hover:shadow-md', className)}>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
        {trend && (
          <p className={cn('text-xs font-medium mt-1 flex items-center gap-0.5', trend.isPositive ? 'text-emerald-500' : 'text-rose-500')}>
            <span>{trend.isPositive ? '↑' : '↓'}</span> {trend.value}
          </p>
        )}
      </div>
      <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
        {icon}
      </div>
    </div>
  )
}
