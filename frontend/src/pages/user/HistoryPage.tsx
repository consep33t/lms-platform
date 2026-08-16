import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  ArrowRight,
  Trophy,
  FileQuestion,
  CheckCircle2,
  XCircle,
  X,
  Award,
  HelpCircle,
  Sparkles
} from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '@/lib/api'

interface ProgressItem {
  module_id: number
  module_title: string
  status: string
  progress_percent: number
  sessions_completed: number
  total_sessions: number
  average_score: number
  certificate_url?: string | null
}

interface OptionReview {
  id: number
  option_text: string
  is_correct: bool
  order: number
}

interface QuestionReview {
  id: number
  question_text: string
  points: number
  order: number
  options: OptionReview[]
  user_selected_option_id: number | null
  is_user_correct: boolean
}

interface QuizReviewData {
  session_id: number
  session_title: string
  module_id: number
  module_title: string
  final_score: number
  passed: boolean
  completed_at: string | null
  total_questions: number
  correct_count: number
  questions: QuestionReview[]
}

interface ModuleSessionItem {
  id: number
  title: string
  order: number
}

export default function HistoryPage() {
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([])
  const [loading, setLoading] = useState(true)

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewData, setReviewData] = useState<QuizReviewData | null>(null)
  const [loadingReview, setLoadingReview] = useState(false)
  const [moduleSessionsMap, setModuleSessionsMap] = useState<Record<number, ModuleSessionItem[]>>({})
  const [expandedModuleId, setExpandedModuleId] = useState<number | null>(null)

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

  const handleToggleExpandModule = async (moduleId: number) => {
    if (expandedModuleId === moduleId) {
      setExpandedModuleId(null)
      return
    }

    setExpandedModuleId(moduleId)
    if (!moduleSessionsMap[moduleId]) {
      try {
        const res = await api.get(`/modules/${moduleId}`)
        if (res.data?.sessions) {
          setModuleSessionsMap((prev) => ({
            ...prev,
            [moduleId]: res.data.sessions,
          }))
        }
      } catch (err) {
        console.error('Failed to fetch module sessions', err)
      }
    }
  }

  const handleOpenReview = async (sessionId: number) => {
    try {
      setLoadingReview(true)
      setReviewModalOpen(true)
      const res = await api.get(`/sessions/${sessionId}/review`)
      setReviewData(res.data)
    } catch (err) {
      alert('Gagal memuat review kuis sesi ini.')
      setReviewModalOpen(false)
    } finally {
      setLoadingReview(false)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-16 text-center text-muted-foreground text-sm">
          Memuat riwayat pembelajaran...
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Pembelajaran & Review Kuis</h1>
          <p className="text-muted-foreground text-sm">
            Pantau progres belajar, periksa sertifikat resmi, dan evaluasi hasil kuis setiap sesi.
          </p>
        </div>

        {progressItems.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground border-dashed">
            Belum ada data modul yang diikuti. Silakan buka katalog modul.
          </Card>
        ) : (
          <div className="space-y-4">
            {progressItems.map((item) => {
              const isDone = item.progress_percent >= 100.0
              const isExpanded = expandedModuleId === item.module_id
              const sessions = moduleSessionsMap[item.module_id] || []

              return (
                <Card key={item.module_id} className="hover:shadow-md transition-all border-border/80 overflow-hidden">
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
                            <span>•</span>
                            <span>Rata-rata Skor: <strong>{item.average_score}%</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleExpandModule(item.module_id)}
                          className="gap-1.5 text-xs"
                        >
                          <FileQuestion className="h-3.5 w-3.5 text-primary" />
                          {isExpanded ? 'Tutup Sesi' : 'Daftar Sesi & Kuis'}
                        </Button>

                        {isDone && (
                          <Link to="/certificates">
                            <Button size="sm" variant="default" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs">
                              <Trophy className="h-3.5 w-3.5" /> Sertifikat
                            </Button>
                          </Link>
                        )}
                        <Link to={`/modules/${item.module_id}`}>
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                            Buka Modul <ArrowRight className="h-3.5 w-3.5" />
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

                    {/* Sesi & Review Accordion */}
                    {isExpanded && (
                      <div className="pt-3 border-t space-y-2 animate-in fade-in duration-200">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                          Sesi Pembelajaran Modul:
                        </div>
                        {sessions.length === 0 ? (
                          <div className="text-xs text-muted-foreground italic py-2">Memuat daftar sesi...</div>
                        ) : (
                          <div className="divide-y rounded-xl border bg-muted/20">
                            {sessions.map((s) => (
                              <div key={s.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px]">
                                    {s.order}
                                  </span>
                                  <span className="font-semibold text-foreground">{s.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-7 text-xs gap-1"
                                    onClick={() => handleOpenReview(s.id)}
                                  >
                                    <Sparkles className="h-3 w-3 text-amber-500" /> Review Kuis
                                  </Button>
                                  <Link to={`/sessions/${s.id}`}>
                                    <Button size="sm" variant="ghost" className="h-7 text-xs">
                                      Buka Sesi
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Modal Review Kuis */}
        {reviewModalOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border-border animate-in fade-in zoom-in-95 duration-200">
              <CardHeader className="border-b pb-4 flex flex-row items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={reviewData?.passed ? 'default' : 'secondary'} className={reviewData?.passed ? 'bg-emerald-600' : ''}>
                      {reviewData?.passed ? 'Lulus KKM' : 'Belum Lulus'}
                    </Badge>
                    <span className="text-xs font-bold text-muted-foreground">
                      Skor Akhir: {reviewData?.final_score}% ({reviewData?.correct_count}/{reviewData?.total_questions} Benar)
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground mt-1">
                    Review Kuis: {reviewData?.session_title}
                  </CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setReviewModalOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="overflow-y-auto p-6 space-y-6 flex-1">
                {loadingReview || !reviewData ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">Memuat data review kuis...</div>
                ) : reviewData.questions.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">Sesi ini tidak memiliki soal kuis.</div>
                ) : (
                  <div className="space-y-6">
                    {reviewData.questions.map((q, qIdx) => (
                      <div key={q.id} className="p-4 rounded-xl border bg-muted/10 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-bold text-sm text-foreground flex items-start gap-2">
                            <span className="text-primary font-mono shrink-0">#{qIdx + 1}.</span>
                            <span>{q.question_text}</span>
                          </div>
                          <Badge variant="outline" className="text-[11px] font-mono shrink-0">
                            {q.is_user_correct ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Benar (+{q.points})
                              </span>
                            ) : (
                              <span className="text-destructive font-bold flex items-center gap-1">
                                <XCircle className="h-3 w-3" /> Salah (0)
                              </span>
                            )}
                          </Badge>
                        </div>

                        {/* Options List */}
                        <div className="space-y-2 pt-1">
                          {q.options.map((opt) => {
                            const isSelected = q.user_selected_option_id === opt.id
                            const isCorrect = opt.is_correct

                            let borderClass = 'border-border/60 bg-background'
                            if (isSelected && isCorrect) {
                              borderClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200'
                            } else if (isSelected && !isCorrect) {
                              borderClass = 'border-destructive bg-destructive/10 text-destructive'
                            } else if (isCorrect) {
                              borderClass = 'border-emerald-500/40 bg-emerald-500/5'
                            }

                            return (
                              <div
                                key={opt.id}
                                className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 transition-colors ${borderClass}`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="h-5 w-5 rounded-full border flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                                    {String.fromCharCode(65 + opt.order)}
                                  </div>
                                  <span className="font-medium">{opt.option_text}</span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {isSelected && (
                                    <Badge variant="outline" className="text-[10px] font-mono">
                                      Pilihan Anda
                                    </Badge>
                                  )}
                                  {isCorrect && (
                                    <Badge className="bg-emerald-600 text-white text-[10px] gap-1 font-bold">
                                      <CheckCircle2 className="h-3 w-3" /> Kunci Benar
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
