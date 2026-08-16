import React from 'react'
import { AppNavbar } from '@/components/organisms/AppNavbar'
import OfflineIndicator from '@/components/pwa/OfflineIndicator'
import { PageTransition } from '@/components/common/PageTransition'
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
 * page transition in/out, offline sync monitor, and responsive container.
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showNavbar = true,
  className = '',
  containerClassName = '',
}) => {
  return (
    <div className={cn('min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200', className)}>
      {/* Top Application Navbar */}
      {showNavbar && <AppNavbar />}

      {/* Main Page Body with PageTransition */}
      <main className={cn('flex-1 w-full container mx-auto px-4 py-6 sm:py-8', containerClassName)}>
        <PageTransition>
          {children}
        </PageTransition>
      </main>

      {/* Global PWA Offline Connectivity Monitor */}
      <OfflineIndicator />
    </div>
  )
}
export default AppLayout
