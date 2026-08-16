import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useTenant } from '@/context/TenantContext'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Search, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Navbar() {
  const { user, clearAuth, isAdmin } = useAuthStore()
  const { brand } = useTenant()
  const [searchOpen, setSearchOpen] = useState(false)

  // Keyboard shortcut Ctrl+K / Cmd+K
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
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight">
              {brand?.logoUrl && (
                <img src={brand.logoUrl} alt="Logo" className="h-6 w-auto object-contain" />
              )}
              <span>{brand?.name || 'LMS Platform'}</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Modul Saya</Link>
              <Link to="/certificates" className="text-muted-foreground hover:text-foreground transition-colors">Sertifikat</Link>
              <Link to="/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5 text-amber-500" /> Leaderboard
              </Link>
              <Link to="/history" className="text-muted-foreground hover:text-foreground transition-colors">Riwayat</Link>
              <Link to="/verify" className="text-muted-foreground hover:text-foreground transition-colors">Cek Sertifikat</Link>
              <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">Tentang</Link>
              {isAdmin() && (
                <Link to="/admin" className="text-primary font-semibold hover:underline">CMS Admin</Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Global Search Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground bg-muted/30 border-border/80 px-2.5 hidden sm:flex"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Cari materi...</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background border text-muted-foreground">
                Ctrl K
              </kbd>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="h-8 w-8 text-muted-foreground sm:hidden"
            >
              <Search className="h-4 w-4" />
            </Button>

            <ThemeToggle />
            <NotificationBell />

            {user ? (
              <div className="flex items-center gap-3 ml-1">
                <Link to="/profile" className="text-sm font-medium text-foreground hover:underline hidden sm:inline">
                  {user.full_name}
                </Link>
                <Button variant="outline" size="sm" onClick={clearAuth}>Logout</Button>
              </div>
            ) : (
              <Link to="/login">
                <Button size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
