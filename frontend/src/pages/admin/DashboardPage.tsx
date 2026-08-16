import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  Users,
  Key,
  CheckCircle,
  TrendingUp,
  Award,
  BarChart3,
  Activity,
  Calendar,
  Sparkles
} from 'lucide-react'
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
  total_certificates_issued?: number
}

interface TrendItem {
  date: string
  count: number
}

interface ScoreDistItem {
  range: string
  count: number
  label: string
}

interface TopModuleItem {
  id: number
  title: string
  enrolled: number
  completed: number
  completion_rate: number
}

interface ActivityItem {
  user_name: string
  session_title: string
  module_title: string
  score: number
  completed_at: string
}

interface AnalyticsData {
  enrollment_trend_7d: TrendItem[]
  score_distribution: ScoreDistItem[]
  top_modules: TopModuleItem[]
  recent_activities: ActivityItem[]
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [resStats, resAnalytics] = await Promise.all([
        api.get('/admin/reports/dashboard'),
        api.get('/admin/reports/analytics')
      ])
      setStats(resStats.data)
      setAnalytics(resAnalytics.data)
    } catch (err) {
      console.error('Failed to fetch admin dashboard data', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate max count for 7-day trend scaling
  const maxTrend = Math.max(...(analytics?.enrollment_trend_7d.map(t => t.count) || [1]), 1)
  const totalScoreDist = (analytics?.score_distribution.reduce((acc, s) => acc + s.count, 0)) || 1

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Admin LMS</h1>
            <p className="text-muted-foreground text-sm">Ringkasan analitik real-time sistem pembelajaran & evaluasi kompetensi LMS Alfanet.</p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="border-border/80 shadow-sm bg-card/70">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Modul</CardTitle>
                <div className="p-2 rounded-xl bg-primary/10 text-primary"><BookOpen className="h-4 w-4" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{loading ? '...' : (stats?.total_modules ?? 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats?.total_sessions ?? 0} Sesi Pembelajaran</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm bg-card/70">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Pengguna</CardTitle>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Users className="h-4 w-4" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{loading ? '...' : (stats?.total_users ?? 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats?.active_users ?? 0} Akun Aktif</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm bg-card/70">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Token Modul</CardTitle>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500"><Key className="h-4 w-4" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{loading ? '...' : (stats?.total_tokens ?? 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats?.active_tokens ?? 0} Token Siap Pakai</p>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm bg-card/70">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kelulusan & Sertifikat</CardTitle>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><Award className="h-4 w-4" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{loading ? '...' : (stats?.total_certificates_issued ?? stats?.total_completions ?? 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Rata-rata Skor: {stats?.average_quiz_score ?? 0}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 7-Day Enrollment Trend */}
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Tren Pendaftaran Peserta (7 Hari Terakhir)
                </CardTitle>
                <CardDescription className="text-xs">Jumlah peserta yang bergabung ke modul setiap hari</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {loading || !analytics ? (
                  <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">Memuat tren...</div>
                ) : (
                  <div className="space-y-4">
                    <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b">
                      {analytics.enrollment_trend_7d.map((t, idx) => {
                        const heightPercent = Math.max(12, Math.round((t.count / maxTrend) * 100))
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                            <span className="text-[11px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                              {t.count}
                            </span>
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className="w-full max-w-[36px] bg-primary/80 group-hover:bg-primary rounded-t-lg transition-all duration-300 shadow-sm"
                            />
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-1">
                              {t.date}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Score Distribution */}
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-600" /> Distribusi Nilai Kelulusan Kuis
                </CardTitle>
                <CardDescription className="text-xs">Rentang persentase nilai peserta yang telah menyelesaikan kuis</CardDescription>
              </CardHeader>
              <CardContent className="pt-2 space-y-4">
                {loading || !analytics ? (
                  <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">Memuat distribusi...</div>
                ) : (
                  <div className="space-y-3.5 pt-1">
                    {analytics.score_distribution.map((dist, idx) => {
                      const pct = Math.round((dist.count / totalScoreDist) * 100)
                      return (
                        <div key={idx} className="space-y-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-foreground flex items-center gap-2">
                              <span>{dist.range}</span>
                              <span className="text-[11px] font-normal text-muted-foreground">({dist.label})</span>
                            </span>
                            <span className="font-bold text-muted-foreground">{dist.count} Peserta ({pct}%)</span>
                          </div>
                          <Progress
                            value={pct}
                            className={`h-2 ${
                              idx === 3 ? '[&>div]:bg-emerald-600' : idx === 2 ? '[&>div]:bg-blue-600' : idx === 1 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'
                            }`}
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Modules & Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Modules */}
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" /> Modul Paling Diminati & Tingkat Kelulusan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading || !analytics ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">Memuat modul terpopuler...</div>
                ) : analytics.top_modules.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">Belum ada modul aktif.</div>
                ) : (
                  <div className="divide-y">
                    {analytics.top_modules.map((m, idx) => (
                      <div key={m.id} className="p-4 flex items-center justify-between gap-3 hover:bg-muted/20">
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded-full bg-muted font-bold text-xs flex items-center justify-center text-muted-foreground">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-xs text-foreground line-clamp-1">{m.title}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {m.enrolled} Terdaftar • {m.completed} Lulus
                            </div>
                          </div>
                        </div>
                        <Badge variant={m.completion_rate >= 50 ? 'default' : 'secondary'} className={m.completion_rate >= 50 ? 'bg-emerald-600' : ''}>
                          {m.completion_rate}% Lulus
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity Feed */}
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" /> Aktivitas Penyelesaian Sesi Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading || !analytics ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">Memuat aktivitas...</div>
                ) : analytics.recent_activities.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">Belum ada aktivitas baru.</div>
                ) : (
                  <div className="divide-y">
                    {analytics.recent_activities.map((act, idx) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/20 text-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-foreground">{act.user_name}</div>
                          <div className="text-[11px] text-muted-foreground line-clamp-1">
                            {act.session_title} ({act.module_title})
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge variant="outline" className="font-mono text-emerald-600 font-bold bg-emerald-500/10 border-emerald-500/30">
                            Skor: {act.score}%
                          </Badge>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {act.completed_at ? new Date(act.completed_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
