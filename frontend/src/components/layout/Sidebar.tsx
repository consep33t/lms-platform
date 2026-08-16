import { Link, useLocation } from 'react-router-dom'
import {
  BookOpen,
  Users,
  Key,
  BarChart3,
  Layers,
  LayoutDashboard,
  Megaphone,
  ShieldCheck,
  Building2,
  CreditCard,
  Package,
  KeyRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const location = useLocation()

  const mainLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/modules', label: 'Modul & Sesi', icon: BookOpen },
    { href: '/admin/users', label: 'Pengguna', icon: Users },
    { href: '/admin/tokens', label: 'Token Akses', icon: Key },
    { href: '/admin/cohorts', label: 'Cohort', icon: Layers },
    { href: '/admin/reports', label: 'Laporan', icon: BarChart3 },
  ]

  const enterpriseLinks = [
    { href: '/admin/tenants', label: 'Organisasi & Tenant', icon: Building2 },
    { href: '/admin/orders', label: 'Keuangan & Kupon', icon: CreditCard },
    { href: '/admin/scorm', label: 'Paket SCORM', icon: Package },
    { href: '/admin/sso', label: 'SSO Korporat', icon: KeyRound },
    { href: '/admin/announcements', label: 'Pengumuman', icon: Megaphone },
    { href: '/admin/audit-logs', label: 'Log Audit', icon: ShieldCheck },
  ]

  return (
    <aside className="w-64 border-r border-border min-h-[calc(100vh-3.5rem)] bg-card p-4 space-y-6 shrink-0">
      <div className="space-y-2">
        <div className="px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Akademik & Modul
        </div>
        <nav className="space-y-0.5">
          {mainLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        <div className="px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Enterprise & Operasional
        </div>
        <nav className="space-y-0.5">
          {enterpriseLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
export default Sidebar
