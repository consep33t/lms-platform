import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { KeyRound, Lock, CheckCircle2, PlayCircle, Clock, FileQuestion, ArrowLeft } from 'lucide-react'
import api from '@/lib/api'

interface SessionItem {
  id: number
  module_id: number
  title: string
  description: string | null
  order: number
  duration_minutes: number
}

interface ModuleDetail {
  id: number
  title: string
  description: string
  passing_score: number
  order: number
  thumbnail_media_id: number | null
  sessions: SessionItem[]
}

export default function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [moduleData, setModuleData] = useState<ModuleDetail | null>(null)
  const [token, setToken] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchModule()
    const savedTokenState = localStorage.getItem(`module_unlocked_${id}`)
    if (savedTokenState === 'true') {
      setIsUnlocked(true)
    }
  }, [id])

  const fetchModule = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/modules/${id}`)
      setModuleData(res.data)
    } catch (err) {
      console.error('Failed to fetch module detail', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) return

    try {
      setSubmitting(true)
      setErrorMsg('')
      setSuccessMsg('')
      const res = await api.post('/modules/verify-token', { token: token.trim() })

      if (res.data.valid) {
        setIsUnlocked(true)
        localStorage.setItem(`module_unlocked_${id}`, 'true')
        setSuccessMsg(res.data.message || 'Token valid! Akses modul berhasil dibuka.')
      } else {
        setErrorMsg(res.data.message || 'Token tidak valid atau telah kadaluarsa.')
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Gagal memverifikasi token. Pastikan kode benar.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-12 text-center text-muted-foreground">
          Memuat data modul...
        </div>
      </PageLayout>
    )
  }

  if (!moduleData) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
          <p className="text-muted-foreground">Modul tidak ditemukan.</p>
          <Button onClick={() => navigate('/')}>Kembali ke Katalog</Button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog
        </Button>

        {/* Header Modul */}
        <div className="space-y-3 border-b pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-primary border-primary">
              Modul #{moduleData.order}
            </Badge>
            <Badge variant="secondary">
              Standar Kelulusan: {moduleData.passing_score}%
            </Badge>
            {isUnlocked ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                <CheckCircle2 className="h-3 w-3" /> Akses Terbuka
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <Lock className="h-3 w-3" /> Terkunci Token
              </Badge>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {moduleData.title}
          </h1>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            {moduleData.description}
          </p>
        </div>

        {/* Kotak Verifikasi Token Jika Belum Terbuka */}
        {!isUnlocked ? (
          <Card className="border-primary/30 bg-gradient-to-b from-primary/10 to-primary/5 shadow-md">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-bold text-lg">
                <Lock className="h-5 w-5" /> Masukkan Token Akses Modul
              </div>
              <CardDescription>
                Modul ini memerlukan token akses pembelajaran yang diberikan oleh instruktur.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleVerify}>
              <CardContent className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-destructive/15 text-destructive text-sm font-medium border border-destructive/30">
                    {errorMsg}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="token" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Kode Token Akses (8 Karakter)
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="token"
                      className="pl-9 font-mono uppercase text-base tracking-widest bg-background h-11"
                      placeholder="MISAL: NET-ADV-2026"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={submitting} className="w-full h-11 text-base font-semibold shadow">
                  {submitting ? 'Memverifikasi...' : 'Buka & Mulai Belajar'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300">Akses Pembelajaran Terbuka</h4>
                <p className="text-xs text-muted-foreground">Silakan selesaikan seluruh materi sesi dan kuis berurutan.</p>
              </div>
            </div>
            {successMsg && (
              <Badge variant="outline" className="border-emerald-500 text-emerald-600">
                {successMsg}
              </Badge>
            )}
          </div>
        )}

        {/* Daftar Sesi Pembelajaran */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">
              Kurikulum Sesi Pembelajaran ({moduleData.sessions?.length || 0} Sesi)
            </h2>
          </div>

          <div className="space-y-3">
            {(!moduleData.sessions || moduleData.sessions.length === 0) ? (
              <Card className="p-6 text-center text-muted-foreground">
                Belum ada sesi yang dipublikasikan pada modul ini.
              </Card>
            ) : (
              moduleData.sessions.map((sess, idx) => (
                <Card
                  key={sess.id}
                  className={`transition-all duration-200 ${
                    isUnlocked
                      ? 'hover:border-primary hover:shadow-md cursor-pointer'
                      : 'opacity-70 bg-muted/30'
                  }`}
                  onClick={() => {
                    if (isUnlocked) navigate(`/sessions/${sess.id}`)
                  }}
                >
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        isUnlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-foreground">
                            {sess.title}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {sess.description || 'Pelajari materi dan selesaikan kuis evaluasi.'}
                        </p>
                        <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="h-3 w-3" /> {sess.duration_minutes} Menit
                          </span>
                          <span className="flex items-center gap-1 font-medium text-primary">
                            <FileQuestion className="h-3 w-3" /> Materi & Kuis
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="self-end sm:self-center shrink-0">
                      {isUnlocked ? (
                        <Button size="sm" className="gap-1.5 font-semibold">
                          <PlayCircle className="h-4 w-4" /> Mulai Sesi
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" disabled className="gap-1.5">
                          <Lock className="h-3.5 w-3.5" /> Terkunci
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
