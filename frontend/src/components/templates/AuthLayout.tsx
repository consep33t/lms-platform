import React from 'react'
import { Link } from 'react-router-dom'
import { useTenant } from '@/context/TenantContext'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import OfflineIndicator from '@/components/pwa/OfflineIndicator'
import { PageTransition } from '@/components/common/PageTransition'
import { GraduationCap } from 'lucide-react'
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
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Brand & Theme Switch */}
      <header className="container mx-auto flex items-center justify-between py-3 relative z-10">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-primary tracking-tight group">
          {brand?.logoUrl ? (
            <img src={brand.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold shadow-sm transition-transform duration-200 group-hover:scale-105">
              <GraduationCap className="w-5 h-5" />
            </div>
          )}
          <span className="font-display font-extrabold text-foreground group-hover:text-primary transition-colors">
            {brand?.name || 'LMS Platform'}
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Centered Auth Card Container */}
      <main className="w-full flex-1 flex items-center justify-center py-8 relative z-10">
        <PageTransition className={cn('w-full max-w-md mx-auto space-y-5', className)}>
          {(title || subtitle) && (
            <div className="text-center space-y-1.5 mb-3">
              {title && <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-foreground">{title}</h1>}
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          )}
          {children}
        </PageTransition>
      </main>

      {/* Footer */}
      <footer className="container mx-auto text-center py-4 text-xs text-muted-foreground relative z-10">
        © {new Date().getFullYear()} {brand?.name || 'LMS Platform'}. Seluruh hak cipta dilindungi.
      </footer>

      <OfflineIndicator />
    </div>
  )
}
export default AuthLayout
