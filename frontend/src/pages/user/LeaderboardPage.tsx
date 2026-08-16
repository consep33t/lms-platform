import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Sparkles,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Building2
} from 'lucide-react'
import api from '@/lib/api'
import { usePageTitle } from '@/hooks/usePageTitle'

interface LeaderboardItem {
  rank: number
  user_id: number
  user_name: string
  institution: string | null
  modules_completed: number
  average_score: number
  total_certificates: number
}

interface ModuleOption {
  id: number
  title: string
}

export default function LeaderboardPage() {
  usePageTitle('Peringkat & Leaderboard Belajar')
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([])
  const [modules, setModules] = useState<ModuleOption[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState<string>('global')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModules()
  }, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [selectedModuleId])

  const fetchModules = async () => {
    try {
      const res = await api.get('/modules')
      setModules(res.data)
    } catch (err) {
      console.error('Failed to fetch modules list', err)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const endpoint = selectedModuleId === 'global' ? '/leaderboard' : `/leaderboard/module/${selectedModuleId}`
      const res = await api.get(endpoint)
      setLeaderboard(res.data.leaderboard)
    } catch (err) {
      console.error('Failed to fetch leaderboard', err)
    } finally {
      setLoading(false)
    }
  }

  const top1 = leaderboard[0]
  const top2 = leaderboard[1]
  const top3 = leaderboard[2]
  const restLeaderboard = leaderboard.slice(3)

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        {/* Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-500/20 via-primary/15 to-transparent p-6 md:p-10 border border-amber-500/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Crown className="h-3.5 w-3.5" /> Papan Peringkat Prestasi Pembelajar
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Leaderboard & Prestasi
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
              Apresiasi peserta dengan akumulasi kelulusan modul tertinggi, skor evaluasi kuis terbaik, dan kepemilikan sertifikat resmi.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="h-10 px-3 py-1 rounded-xl border bg-background text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="global">🏆 Peringkat Global</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
            <Button variant="outline" size="icon" onClick={fetchLeaderboard} className="h-10 w-10 shrink-0">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-muted-foreground">Memuat papan peringkat...</div>
        ) : leaderboard.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto opacity-40 mb-3" />
            <h3 className="font-bold text-sm text-foreground">Belum Ada Catatan Peringkat</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Selesaikan modul dan raih skor kuis tertinggi untuk masuk ke daftar peringkat.
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-6">
              {/* Rank 2 - Silver */}
              {top2 && (
                <Card className="border-slate-400/40 bg-slate-500/5 shadow-md order-2 md:order-1 text-center p-6 space-y-3 relative">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-slate-300 dark:bg-slate-700 border-2 border-slate-400 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200 shadow">
                    #2
                  </div>
                  <Medal className="h-8 w-8 text-slate-400 mx-auto pt-2" />
                  <div>
                    <h4 className="font-bold text-base text-foreground line-clamp-1">{top2.user_name}</h4>
                    {top2.institution && (
                      <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3" /> {top2.institution}
                      </p>
                    )}
                  </div>
                  <div className="pt-2 border-t flex justify-around text-xs">
                    <div>
                      <div className="font-bold text-foreground">{top2.modules_completed}</div>
                      <div className="text-[10px] text-muted-foreground">Modul</div>
                    </div>
                    <div>
                      <div className="font-bold text-primary">{top2.average_score}%</div>
                      <div className="text-[10px] text-muted-foreground">Rata-rata</div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Rank 1 - Gold */}
              {top1 && (
                <Card className="border-amber-500/60 bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-background shadow-xl order-1 md:order-2 text-center p-6 space-y-3 relative scale-105 border-2">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-amber-950 font-black text-lg flex items-center justify-center shadow-lg">
                    <Crown className="h-6 w-6" />
                  </div>
                  <Trophy className="h-10 w-10 text-amber-500 mx-auto pt-4" />
                  <div>
                    <Badge className="bg-amber-500 text-amber-950 font-extrabold text-[10px] uppercase mb-1">
                      Juara 1
                    </Badge>
                    <h3 className="font-extrabold text-lg text-foreground line-clamp-1">{top1.user_name}</h3>
                    {top1.institution && (
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                        <Building2 className="h-3.5 w-3.5" /> {top1.institution}
                      </p>
                    )}
                  </div>
                  <div className="pt-3 border-t border-amber-500/20 flex justify-around text-xs">
                    <div>
                      <div className="font-extrabold text-sm text-foreground">{top1.modules_completed}</div>
                      <div className="text-[10px] text-muted-foreground">Modul Selesai</div>
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-amber-600 dark:text-amber-400">{top1.average_score}%</div>
                      <div className="text-[10px] text-muted-foreground">Skor Rata-rata</div>
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-foreground">{top1.total_certificates}</div>
                      <div className="text-[10px] text-muted-foreground">Sertifikat</div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Rank 3 - Bronze */}
              {top3 && (
                <Card className="border-amber-700/40 bg-amber-700/5 shadow-md order-3 text-center p-6 space-y-3 relative">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-amber-700/20 border-2 border-amber-700/60 flex items-center justify-center font-bold text-amber-700 dark:text-amber-400 shadow">
                    #3
                  </div>
                  <Medal className="h-8 w-8 text-amber-700/70 dark:text-amber-500 mx-auto pt-2" />
                  <div>
                    <h4 className="font-bold text-base text-foreground line-clamp-1">{top3.user_name}</h4>
                    {top3.institution && (
                      <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3" /> {top3.institution}
                      </p>
                    )}
                  </div>
                  <div className="pt-2 border-t flex justify-around text-xs">
                    <div>
                      <div className="font-bold text-foreground">{top3.modules_completed}</div>
                      <div className="text-[10px] text-muted-foreground">Modul</div>
                    </div>
                    <div>
                      <div className="font-bold text-primary">{top3.average_score}%</div>
                      <div className="text-[10px] text-muted-foreground">Rata-rata</div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Rank 4+ Table */}
            {restLeaderboard.length > 0 && (
              <Card className="border-border/80 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/20 border-b pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> Peringkat Pembelajar Lainnya
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y text-xs">
                    {restLeaderboard.map((item) => (
                      <div key={item.user_id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/20">
                        <div className="flex items-center gap-3">
                          <span className="h-7 w-7 rounded-full bg-muted flex items-center justify-center font-bold font-mono text-muted-foreground">
                            #{item.rank}
                          </span>
                          <div>
                            <div className="font-bold text-sm text-foreground">{item.user_name}</div>
                            {item.institution && (
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-3 w-3" /> {item.institution}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-right">
                          <div>
                            <div className="font-bold text-foreground">{item.modules_completed} Selesai</div>
                            <div className="text-[10px] text-muted-foreground">{item.total_certificates} Sertifikat</div>
                          </div>
                          <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                            {item.average_score}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
