import React from 'react'
import { AppNavbar } from '@/components/organisms/AppNavbar'
import { Sidebar } from '@/components/layout/Sidebar'
import OfflineIndicator from '@/components/pwa/OfflineIndicator'
import { cn } from '@/lib/utils'

export interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/**
 * Template AdminLayout Component
 * Standard layout wrapper for CMS Administration pages with sidebar navigation.
 */
export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors">
      <AppNavbar />
      <div className="flex-1 flex w-full">
        <Sidebar />
        <main className={cn('flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full', className)}>
          {(title || action) && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-border">
              <div>
                {title && <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>}
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
              </div>
              {action && <div className="flex items-center gap-2">{action}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
      <OfflineIndicator />
    </div>
  )
}
export default AdminLayout
