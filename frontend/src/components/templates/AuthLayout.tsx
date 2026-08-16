import React from 'react'
import { Link } from 'react-router-dom'
import { useTenant } from '@/context/TenantContext'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import OfflineIndicator from '@/components/pwa/OfflineIndicator'
import { GraduationCap, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
}

/**
 * Template AuthLayout Component
 * Centered glassmorphic card layout for authentication pages with tenant branding.
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  className = '',
}) => {
  const { brand } = useTenant()

  return (
    <div className="min-h-screen bg-muted/40 text-foreground flex flex-col justify-between p-4 relative overflow-hidden">
      {/* Top Bar with Brand & Theme Switch */}
      <header className="container mx-auto flex items-center justify-between py-2">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight">
          {brand?.logoUrl ? (
            <img src={brand.logoUrl} alt="Logo" className="h-7 w-auto object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
          )}
          <span>{brand?.name || 'LMS Platform'}</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Centered Auth Card Container */}
      <main className="w-full flex-1 flex items-center justify-center py-8">
        <div className={cn('w-full max-w-md mx-auto space-y-4', className)}>
          {(title || subtitle) && (
            <div className="text-center space-y-1 mb-2">
              {title && <h1 className="text-2xl font-black tracking-tight text-foreground">{title}</h1>}
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto text-center py-3 text-xs text-muted-foreground">
        © {new Date().getFullYear()} {brand?.name || 'LMS Platform'}. Hak Cipta Dilindungi.
      </footer>

      <OfflineIndicator />
    </div>
  )
}
export default AuthLayout
