import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

export interface ProgressBarProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number
  showPercentage?: boolean
  indicatorClassName?: string
}

/**
 * Unified Atomic Progress Bar Component
 * Built on Radix UI with smooth width transitions and dynamic theme tokens.
 */
export const ProgressBar = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressBarProps
>(({ className, value = 0, showPercentage = false, indicatorClassName, ...props }, ref) => {
  const clampedValue = Math.min(100, Math.max(0, value || 0))

  return (
    <div className="w-full flex flex-col gap-1.5">
      {showPercentage && (
        <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
          <span>Progres</span>
          <span>{Math.round(clampedValue)}%</span>
        </div>
      )}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-secondary', className)}
        value={clampedValue}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn('h-full w-full flex-1 bg-primary transition-all duration-500 ease-out', indicatorClassName)}
          style={{ transform: `translateX(-${100 - clampedValue}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
})

ProgressBar.displayName = 'ProgressBar'
export const Progress = ProgressBar
