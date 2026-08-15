import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Award, CheckCircle2, BookOpen, ArrowRight, Trophy, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '@/lib/api'

numbererface ProgressItem {
  module_id: number
  module_title: string
  status: string
  progress_percent: number
  sessions_completed: number
  total_sessions: number
  average_score: number
  certificate_url?: string | null
}

export default function HistoryPage() {
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      setLoading(true)
      const res = await api.get('/users/me/progress')
      setProgressItems(res.data)
    } catch (err) {
      console.error('Failed to fetch user learning progress', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-16 text-center text-muted-foreground">
          Memuat riwayat pembelajaran...
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Pembelajaran & Sertifikat</h1>
          <p className="text-muted-foreground text-sm">Pantau kemajuan modul, sesi yang telah selesai, dan nilai kelulusan kuis Anda.</p>
        </div>

        {progressItems.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground border-dashed">
            Belum ada data modul yang diikuti. Silakan buka katalog modul.
          </Card>
        ) : (
          <div className="space-y-4">
            {progressItems.map((item) => {
              const isDone = item.progress_percent >= 100.0

              return (
                <Card key={item.module_id} className="hover:shadow-md transition-shadow border-border/80">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                          isDone ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'
                        }`}>
                          {isDone ? <Trophy className="h-6 w-6" /> : <BookOpen className="h-6 w-6" />}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg">{item.module_title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span>Selesai: <strong>{item.sessions_completed}</strong> / {item.total_sessions} Sesi</span>
                            <span>�</span>
                            <span>Rata-rata Skor: <strong>{item.average_score}%</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Badge variant={isDone ? 'default' : 'secondary'} className={isDone ? 'bg-emerald-600' : ''}>
                          {isDone ? 'Selesai (Lulus)' : 'Sedang Berjalan'}
                        </Badge>
                        <Link to={`/modules/${item.module_id}`}>
                          <Button size="sm" variant="outline" className="gap-2">
                            Buka Modul <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">Progres Modul</span>
                        <span className="text-primary">{item.progress_percent}%</span>
                      </div>
                      <Progress value={item.progress_percent} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
