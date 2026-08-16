import React from 'react'
import { AppNavbar } from '@/components/organisms/AppNavbar'
import OfflineIndicator from '@/components/pwa/OfflineIndicator'
import { cn } from '@/lib/utils'

export interface AppLayoutProps {
  children: React.ReactNode
  showNavbar?: boolean
  className?: string
  containerClassName?: string
}

/**
 * Template AppLayout Component
 * Master template wrapping the application with dynamic theme, global navbar,
 * offline sync monitor, and responsive container.
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showNavbar = true,
  className = '',
  containerClassName = '',
}) => {
  return (
    <div className={cn('min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors', className)}>
      {/* Top Application Navbar */}
      {showNavbar && <AppNavbar />}

      {/* Main Page Body */}
      <main className={cn('flex-1 w-full container mx-auto px-4 py-6', containerClassName)}>
        {children}
      </main>

      {/* Global PWA Offline Connectivity Monitor */}
      <OfflineIndicator />
    </div>
  )
}
export default AppLayout
