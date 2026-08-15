import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  KeyRound,
  Lock,
  CheckCircle2,
  PlayCircle,
  Clock,
  FileQuestion,
  ArrowLeft,
  Trophy,
  AlertCircle,
  CheckCircle,
  RotateCcw
} from 'lucide-react'
import api from '@/lib/api'

interface SessionItem {
  id: number
  module_id: number
  title: string
  description: string | null
  order: number
  duration_minutes: number
}

interface SessionStatusItem {
  session_id: number
  title: string
  order: number
  duration_minutes: number
  is_completed: boolean
  score: number | null
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

interface ModuleUserStatus {
  module_id: number
  is_unlocked: boolean
  status: string
  progress_percent: number
  sessions_completed: number
  total_sessions: number
  average_score: number
  certificate_url: string | null
  sessions: SessionStatusItem[]
}

export default function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [moduleData, setModuleData] = useState<ModuleDetail | null>(null)
  const [userStatus, setUserStatus] = useState<ModuleUserStatus | null>(null)
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchModuleAndStatus()
  }, [id])

  const fetchModuleAndStatus = async () => {
    try {
      setLoading(true)
      const resMod = await api.get(`/modules/${id}`)
      setModuleData(resMod.data)

      try {
        const resStat = await api.get(`/modules/${id}/user-status`)
        setUserStatus(resStat.data)
      } catch (err) {
        // User maybe guest or not enrolled
        setUserStatus(null)
      }
    } catch (err) {
      console.error('Failed to fetch module detail', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim() || !id) return

    try {
      setSubmitting(true)
      setErrorMsg('')
      setSuccessMsg('')

      const res = await api.post(`/modules/${id}/unlock`, {
        token: token.trim(),
        module_id: parseInt(id),
      })

      if (res.data.valid) {
        setSuccessMsg(res.data.message || 'Token valid! Akses modul berhasil dibuka.')
        setToken('')
        await fetchModuleAndStatus()
      } else {
        setErrorMsg(res.data.message || 'Token tidak valid atau telah kadaluarsa.')
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Gagal memverifikasi token. Pastikan token sesuai dengan modul ini.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-16 text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground text-sm font-medium">Memuat rincian modul & kurikulum...</p>
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

  const isUnlocked = userStatus?.is_unlocked ?? false
  const isCompleted = userStatus ? userStatus.progress_percent >= 100.0 : false

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog
        </Button>

        {/* Header Modul */}
        <div className="space-y-4 border-b pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-primary border-primary font-bold">
              Modul #{moduleData.order}
            </Badge>
            <Badge variant="secondary" className="font-mono text-xs">
              Standar Kelulusan (KKM): {moduleData.passing_score}%
            </Badge>
            {isUnlocked ? (
              <Badge className={isCompleted ? 'bg-emerald-600 hover:bg-emerald-700 gap-1' : 'bg-blue-600 hover:bg-blue-700 gap-1'}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isCompleted ? 'Modul Selesai & Lulus' : 'Akses Terbuka (Sedang Berjalan)'}
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <Lock className="h-3.5 w-3.5" /> Terkunci Token
              </Badge>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {moduleData.title}
          </h1>
          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            {moduleData.description}
          </p>

          {/* Progress Kumulatif Modul Jika Terbuka */}
          {isUnlocked && userStatus && (
            <div className="pt-2 p-4 rounded-xl bg-muted/40 border space-y-2.5">
              <div className="flex flex-col sm:flex-row justify-between text-xs font-semibold gap-1">
                <span className="text-foreground">
                  Kemajuan Modul: <strong>{userStatus.sessions_completed}</strong> dari <strong>{userStatus.total_sessions}</strong> Sesi Selesai ({userStatus.progress_percent}%)
                </span>
                <span className="text-primary">
                  Rata-rata Skor Kuis: <strong>{userStatus.average_score}%</strong>
                </span>
              </div>
              <Progress value={userStatus.progress_percent} className="h-2.5" />
            </div>
          )}
        </div>

        {/* Kotak Verifikasi Token Jika Belum Terbuka */}
        {!isUnlocked ? (
          <Card className="border-primary/40 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent shadow-md overflow-hidden">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-bold text-lg">
                <Lock className="h-5 w-5" /> Buka Akses Modul dengan Token
              </div>
              <CardDescription className="text-xs md:text-sm leading-relaxed">
                Modul ini memerlukan token akses pembelajaran khusus modul ini. Pastikan Anda memasukkan kode token yang sesuai.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleVerify}>
              <CardContent className="space-y-4">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-destructive/15 text-destructive text-sm font-medium border border-destructive/30 flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="token" className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Kode Token Akses Khusus Modul Ini
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="token"
                      className="pl-10 font-mono uppercase text-base tracking-widest bg-background h-11 border-primary/30 focus-visible:ring-primary"
                      placeholder="MISAL: NET-ADV-2026"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button type="submit" disabled={submitting} className="w-full h-11 text-base font-bold shadow">
                  {submitting ? 'Memverifikasi...' : 'Buka Akses & Mulai Belajar'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                {isCompleted ? <Trophy className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm md:text-base">
                  {isCompleted ? 'Selamat! Anda Telah Menyelesaikan Modul Ini' : 'Akses Pembelajaran Aktif'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {isCompleted
                    ? 'Seluruh kuis sesi telah lulus. Anda dapat mengulas kembali materi kapan saja.'
                    : 'Silakan pelajari materi dan selesaikan kuis di setiap sesi pembelajaran di bawah.'}
                </p>
              </div>
            </div>
            {successMsg && (
              <Badge variant="outline" className="border-emerald-500 text-emerald-600 self-start sm:self-center">
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
              <Card className="p-8 text-center text-muted-foreground border-dashed">
                Belum ada sesi yang dipublikasikan pada modul ini.
              </Card>
            ) : (
              moduleData.sessions.map((sess, idx) => {
                const sessStatus = userStatus?.sessions.find(s => s.session_id === sess.id)
                const isSessionDone = sessStatus?.is_completed ?? false
                const sessionScore = sessStatus?.score

                return (
                  <Card
                    key={sess.id}
                    className={`transition-all duration-200 ${
                      isUnlocked
                        ? 'hover:border-primary hover:shadow-md cursor-pointer border-border/90'
                        : 'opacity-70 bg-muted/30 border-dashed'
                    }`}
                    onClick={() => {
                      if (isUnlocked) navigate(`/sessions/${sess.id}`)
                    }}
                  >
                    <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                          isSessionDone
                            ? 'bg-emerald-500/15 text-emerald-600'
                            : (isUnlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')
                        }`}>
                          {isSessionDone ? <CheckCircle className="h-5 w-5" /> : `#${idx + 1}`}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-base text-foreground">
                              {sess.title}
                            </h3>
                            {isUnlocked && (
                              isSessionDone ? (
                                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1 font-mono">
                                  <CheckCircle2 className="h-3 w-3" /> Lulus ({sessionScore}%)
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Belum Selesai
                                </Badge>
                              )
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {sess.description || 'Pelajari materi video/teks dan selesaikan kuis evaluasi.'}
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
                          <Button size="sm" className={`gap-1.5 font-bold ${isSessionDone ? 'bg-muted text-foreground hover:bg-muted/80' : 'shadow'}`}>
                            {isSessionDone ? (
                              <><RotateCcw className="h-3.5 w-3.5" /> Ulas Sesi</>
                            ) : (
                              <><PlayCircle className="h-4 w-4" /> Buka Sesi</>
                            )}
                          </Button>
                        ) : (
                          <Button size="sm" variant="secondary" disabled className="gap-1.5">
                            <Lock className="h-3.5 w-3.5" /> Terkunci
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
