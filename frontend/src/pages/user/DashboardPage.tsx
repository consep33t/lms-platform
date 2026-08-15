import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Link } from 'react-router-dom'
import { BookOpen, Search, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react'
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

export default function DashboardPage() {
  const [modules, setModules] = useState<ModuleItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      setLoading(true)
      const res = await api.get('/modules')
      setModules(res.data)
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
      <div className="space-y-8">
        {/* Banner Hero */}
        <div className="rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6 md:p-8 border border-primary/20">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Platform Pembelajaran Terstruktur
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Katalog Modul Pembelajaran
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Akses modul jaringan komputer, routing MikroTik, dan keamanan siber. Masukkan token akses untuk membuka materi video dan kuis sertifikasi.
            </p>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari materi / modul..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted-foreground font-medium self-end sm:self-center">
            Menampilkan {filtered.length} dari {modules.length} Modul
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
            {filtered.map((module) => (
              <Card key={module.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-border/80 group">
                {/* Thumbnail Header */}
                <div className="relative h-44 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center overflow-hidden">
                  {module.thumbnail_media_id ? (
                    <img
                      src={`/api/v1/media/${module.thumbnail_media_id}/stream`}
                      alt={module.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        // Fallback gradient if image not ready
                        (e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                  ) : null}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge variant="secondary" className="backdrop-blur-md bg-background/80 font-mono text-xs">
                      KKM: {module.passing_score}%
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-primary/90 hover:bg-primary">
                      Modul #{module.order}
                    </Badge>
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

                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
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
                    <Button className="w-full font-semibold shadow-sm">
                      Buka Modul & Materi
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}

