import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Users, Key, BarChart3, Layers, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const location = useLocation()

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/modules', label: 'Modul & Sesi', icon: BookOpen },
    { href: '/admin/users', label: 'Pengguna', icon: Users },
    { href: '/admin/tokens', label: 'Token Akses', icon: Key },
    { href: '/admin/cohorts', label: 'Cohort', icon: Layers },
    { href: '/admin/reports', label: 'Laporan', icon: BarChart3 },
  ]

  return (
    <aside className="w-64 border-r min-h-[calc(100vh-3.5rem)] bg-card p-4 space-y-2">
      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        CMS Management
      </div>
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.href
          return (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
