import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useTenant } from '@/context/TenantContext'
import { Button } from '@/components/atoms/Button'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Search, Trophy, LogOut, LayoutDashboard, Sparkles } from 'lucide-react'

/**
 * Organism AppNavbar Component
 * Top navigation bar featuring dynamic brand identity, navigation routes, quick search shortcut,
 * notification center, theme switcher, and user account management.
 */
export const AppNavbar: React.FC = () => {
  const { user, clearAuth, isAdmin } = useAuthStore()
  const { brand } = useTenant()
  const [searchOpen, setSearchOpen] = useState(false)

  // Global Keyboard Shortcut: Ctrl+K or Cmd+K to open global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight">
              {brand?.logoUrl ? (
                <img src={brand.logoUrl} alt="Logo" className="h-6 w-auto object-contain" />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <span>{brand?.name || 'LMS Platform'}</span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Modul Saya
              </Link>
              <Link to="/certificates" className="text-muted-foreground hover:text-foreground transition-colors">
                Sertifikat
              </Link>
              <Link to="/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                <span>Leaderboard</span>
              </Link>
              <Link to="/study-rooms" className="text-muted-foreground hover:text-foreground transition-colors">
                Study Rooms
              </Link>
              <Link to="/history" className="text-muted-foreground hover:text-foreground transition-colors">
                Riwayat
              </Link>
              <Link to="/verify" className="text-muted-foreground hover:text-foreground transition-colors">
                Cek Sertifikat
              </Link>
              {isAdmin() && (
                <Link to="/admin" className="text-primary font-semibold hover:underline flex items-center gap-1">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>CMS Admin</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Action Center (Search, Theme, Notifications, Profile) */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground bg-muted/40 hidden sm:flex"
              leftIcon={<Search className="h-3.5 w-3.5" />}
            >
              <span>Cari...</span>
              <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border bg-background px-1 font-mono text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </Button>

            <ThemeToggle />
            <NotificationBell />

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-xs font-medium text-foreground hover:text-primary transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden lg:inline">{user.full_name}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAuth}
                  title="Keluar"
                  className="p-1.5 h-8 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="default" size="sm">
                    Masuk
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
