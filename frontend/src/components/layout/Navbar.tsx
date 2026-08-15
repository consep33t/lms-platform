import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { Link } from 'react-router-dom'

export function Navbar() {
  const { user, clearAuth, isAdmin } = useAuthStore()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-bold text-lg text-primary tracking-tight">
            LMS Platform
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Modul Saya</Link>
            <Link to="/history" className="text-muted-foreground hover:text-foreground transition-colors">Riwayat</Link>
            <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">Tentang</Link>
            {isAdmin() && (
              <Link to="/admin" className="text-primary font-semibold hover:underline">CMS Admin</Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          {user ? (
            <div className="flex items-center gap-3">
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
  )
}
