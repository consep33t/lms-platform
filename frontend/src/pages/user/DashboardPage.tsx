import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Link } from 'react-router-dom'
import { BookOpen, Search, Sparkles, CheckCircle2, ShieldCheck, Lock, PlayCircle, Trophy } from 'lucide-react'
import api from '@/lib/api'

interface ModuleItem {
  id: number
  title: string
  description: string
  status: string
  passing_score: number
  order: number
  thumbnail_media_id: number | null
}

interface UserProgressItem {
  module_id: number
  module_title: string
  status: string
  progress_percent: number
  sessions_completed: number
  total_sessions: number
  average_score: number
}

export default function DashboardPage() {
  const [modules, setModules] = useState<ModuleItem[]>([])
  const [userProgressMap, setUserProgressMap] = useState<Record<number, UserProgressItem>>({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const resMods = await api.get('/modules')
      setModules(resMods.data)

      try {
        const resProg = await api.get('/users/me/progress')
        const pMap: Record<number, UserProgressItem> = {}
        for (const p of resProg.data) {
          pMap[p.module_id] = p
        }
        setUserProgressMap(pMap)
      } catch (err) {
        // Non-blocking if guest
      }
    } catch (err) {
      console.error('Failed to fetch modules', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = modules.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageLayout>
      <div className="space-y-8 pb-12">
        {/* Banner Hero */}
        <div className="rounded-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 md:p-10 border border-primary/20 shadow-sm">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Platform Pembelajaran Terstruktur Alfanet
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Katalog Modul & Kursus Interaktif
            </h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Pelajari arsitektur jaringan, mikrotik routing, dan keamanan Zero Trust. Selesaikan materi video berkualitas tinggi dan evaluasi kuis sertifikasi.
            </p>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari materi / modul..."
              className="pl-9 h-11 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted-foreground font-medium self-end sm:self-center">
            Menampilkan <strong>{filtered.length}</strong> dari {modules.length} Modul
          </div>
        </div>

        {/* Grid Modul */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="animate-pulse">
                <div className="h-44 bg-muted rounded-t-xl" />
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-6 bg-muted rounded w-4/5" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 border rounded-xl border-dashed">
            <p className="text-muted-foreground">Tidak ada modul yang cocok dengan pencarian.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((module) => {
              const uProg = userProgressMap[module.id]
              const isEnrolled = uProg !== undefined
              const isCompleted = uProg ? uProg.progress_percent >= 100.0 : false

              return (
                <Card key={module.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 border-border/80 group">
                  {/* Thumbnail Header */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center overflow-hidden">
                    {module.thumbnail_media_id ? (
                      <img
                        src={`/api/v1/media/${module.thumbnail_media_id}/stream`}
                        alt={module.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none'
                        }}
                      />
                    ) : null}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge variant="secondary" className="backdrop-blur-md bg-background/80 font-mono text-xs shadow-sm">
                        KKM: {module.passing_score}%
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <Badge className="bg-primary/90 hover:bg-primary font-bold shadow-sm">
                        Modul #{module.order}
                      </Badge>
                      {isEnrolled && (
                        <Badge className={isCompleted ? 'bg-emerald-600' : 'bg-blue-600'}>
                          {isCompleted ? 'Lulus' : `${uProg.progress_percent}% Selesai`}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardHeader className="flex-1 space-y-2">
                    <CardTitle className="line-clamp-2 text-lg font-bold group-hover:text-primary transition-colors">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 text-xs leading-relaxed">
                      {module.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-3">
                    {/* Progress Bar Kumulatif jika User Terdaftar */}
                    {isEnrolled && (
                      <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="text-muted-foreground">Progres Belajar:</span>
                          <span className="text-primary">{uProg.sessions_completed} / {uProg.total_sessions} Sesi</span>
                        </div>
                        <Progress value={uProg.progress_percent} className="h-1.5" />
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t">
                      <span className="flex items-center gap-1.5 font-medium">
                        <BookOpen className="h-3.5 w-3.5 text-primary" /> Materi & Video
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Kuis & Sertifikat
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Link to={`/modules/${module.id}`} className="w-full">
                      <Button className={`w-full font-bold shadow-sm ${isCompleted ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}>
                        {isCompleted ? (
                          <><Trophy className="h-4 w-4 mr-2" /> Ulas Modul (Selesai)</>
                        ) : isEnrolled ? (
                          <><PlayCircle className="h-4 w-4 mr-2" /> Lanjutkan Pembelajaran</>
                        ) : (
                          <><Lock className="h-4 w-4 mr-2" /> Buka Modul (Perlu Token)</>
                        )}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
