import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BookOpen, Users, Key, CheckCircle, TrendingUp, ShieldAlert, Award } from 'lucide-react'
import api from '@/lib/api'

interface DashboardStats {
  total_users: number
  active_users: number
  total_modules: number
  total_sessions: number
  total_tokens: number
  active_tokens: number
  total_completions: number
  average_quiz_score: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/reports/dashboard')
      setStats(res.data)
    } catch (err) {
      console.error('Failed to fetch admin dashboard stats', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Admin LMS</h1>
            <p className="text-muted-foreground text-sm">Ringkasan analitik real-time sistem pembelajaran LMS Alfanet.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Modul</CardTitle>
                <div className="p-2 rounded-lg bg-primary/10 text-primary"><BookOpen className="h-4 w-4" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{loading ? '...' : (stats?.total_modules ?? 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats?.total_sessions ?? 0} Sesi Pembelajaran</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Pengguna</CardTitle>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Users className="h-4 w-4" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{loading ? '...' : (stats?.total_users ?? 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats?.active_users ?? 0} Akun Aktif</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Token Modul</CardTitle>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><Key className="h-4 w-4" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{loading ? '...' : (stats?.total_tokens ?? 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats?.active_tokens ?? 0} Token Siap Pakai</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kelulusan Sesi</CardTitle>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><CheckCircle className="h-4 w-4" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{loading ? '...' : (stats?.total_completions ?? 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Rata-rata Skor: {stats?.average_quiz_score ?? 0}%</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
