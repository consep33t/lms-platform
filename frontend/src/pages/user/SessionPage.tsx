import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  FileQuestion,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  PlayCircle,
  FileText,
  Clock,
  Sparkles,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import api from '@/lib/api'

interface OptionItem {
  id: number
  option_text: string
}

interface QuestionItem {
  id: number
  question_text: string
  points: number
  options: OptionItem[]
}

interface ContentItem {
  id: number
  content_type: 'text' | 'video' | 'image' | 'pdf'
  title: string
  body_text?: string
  media_file_id?: number
  order: number
}

interface SessionData {
  id: number
  module_id: number
  title: string
  description?: string
  duration_minutes: number
  passing_score: number
  contents: ContentItem[]
  questions: QuestionItem[]
}

interface QuestionFeedback {
  question_id: number
  selected_option_id: number
  is_correct: boolean
}

export default function SessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'materi' | 'kuis'>('materi')

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState<number>(0)
  const [isPassed, setIsPassed] = useState<boolean>(false)
  const [correctCount, setCorrectCount] = useState<number>(0)
  const [feedback, setFeedback] = useState<QuestionFeedback[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    fetchSession()
    fetchProgress()
  }, [id])

  const fetchSession = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/sessions/${id}`)
      setSession(res.data)
    } catch (err) {
      console.error('Failed to fetch session detail', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const res = await api.get(`/sessions/${id}/progress`)
      if (res.data.is_completed) {
        setIsSubmitted(true)
        setIsPassed(true)
        if (res.data.score !== null) {
          setQuizScore(Math.round(res.data.score))
        }
      }
    } catch (err) {
      // Non-blocking progress check
    }
  }

  const handleSelectOption = (questionId: number, optionId: number) => {
    if (isSubmitted && isPassed) return
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }))
  }

  const handleSubmitQuiz = async () => {
    if (!session?.questions || session.questions.length === 0) return

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      const answerPayload = Object.entries(selectedAnswers).map(([qId, optId]) => ({
        question_id: parseInt(qId),
        selected_option_id: optId,
      }))

      const res = await api.post(`/sessions/${id}/submit`, {
        session_id: parseInt(id || '1'),
        answers: answerPayload,
        time_spent_seconds: 60,
      })

      const data = res.data
      setQuizScore(Math.round(data.score))
      setIsPassed(data.passed)
      setCorrectCount(data.correct_count)
      setFeedback(data.feedback || [])
      setIsSubmitted(true)
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || 'Gagal mengirimkan jawaban kuis. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetakeQuiz = () => {
    setSelectedAnswers({})
    setIsSubmitted(false)
    setQuizScore(0)
    setIsPassed(false)
    setFeedback([])
    setSubmitError(null)
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-16 text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground text-sm font-medium">Memuat materi pembelajaran...</p>
        </div>
      </PageLayout>
    )
  }

  if (!session) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
          <p className="text-muted-foreground">Sesi pembelajaran tidak ditemukan.</p>
          <Button onClick={() => navigate('/')}>Kembali ke Katalog</Button>
        </div>
      </PageLayout>
    )
  }

  const totalQuestions = session.questions?.length || 0
  const answeredCount = Object.keys(selectedAnswers).length
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Navigasi Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <Link to={`/modules/${session.module_id}`}>
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Modul
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5" /> {session.duration_minutes} Menit
            </Badge>
            {isPassed && (
              <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 text-xs">
                <CheckCircle className="h-3.5 w-3.5" /> Sesi Selesai (Lulus)
              </Badge>
            )}
          </div>
        </div>

        {/* Judul Sesi */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {session.title}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            {session.description || 'Pelajari materi pembelajaran, simak video demonstrasi, lalu selesaikan evaluasi pemahaman di bawah ini.'}
          </p>
        </div>

        {/* Tabs: Materi vs Kuis */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/60 rounded-xl">
            <TabsTrigger value="materi" className="gap-2 font-bold text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BookOpen className="h-4 w-4 text-primary" /> Materi Pembelajaran
            </TabsTrigger>
            <TabsTrigger value="kuis" className="gap-2 font-bold text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileQuestion className="h-4 w-4 text-primary" /> Kuis Evaluasi ({totalQuestions} Soal)
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: KONTEN MATERI PEMBELAJARAN */}
          <TabsContent value="materi" className="space-y-6 pt-4">
            {(!session.contents || session.contents.length === 0) ? (
              <Card className="p-8 text-center text-muted-foreground border-dashed">
                Materi pembelajaran sedang dipersiapkan oleh instruktur.
              </Card>
            ) : (
              session.contents.map((item) => (
                <Card key={item.id} className="overflow-hidden border-border/80 shadow-sm">
                  <CardHeader className="bg-muted/20 border-b pb-3">
                    <div className="flex items-center gap-2">
                      {item.content_type === 'video' && <PlayCircle className="h-4 w-4 text-blue-500" />}
                      {item.content_type === 'text' && <FileText className="h-4 w-4 text-primary" />}
                      {item.content_type === 'image' && <Sparkles className="h-4 w-4 text-emerald-500" />}
                      <CardTitle className="text-base font-bold">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {/* Render Text Body */}
                    {item.body_text && (
                      <div className="prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed whitespace-pre-line text-foreground/90 font-normal">
                        {item.body_text}
                      </div>
                    )}

                    {/* Render Image / Diagram */}
                    {item.content_type === 'image' && item.media_file_id && (
                      <div className="rounded-xl overflow-hidden border bg-black/5 flex items-center justify-center p-2">
                        <img
                          src={`/api/v1/media/${item.media_file_id}/stream`}
                          alt={item.title}
                          className="max-h-[480px] w-auto object-contain rounded-lg shadow-sm"
                        />
                      </div>
                    )}

                    {/* Render HTML5 Video Streaming Player */}
                    {item.content_type === 'video' && item.media_file_id && (
                      <div className="rounded-xl overflow-hidden border bg-black shadow-lg">
                        <video
                          controls
                          controlsList="nodownload"
                          playsInline
                          preload="metadata"
                          className="w-full max-h-[500px] aspect-video object-contain"
                          src={`/api/v1/media/${item.media_file_id}/stream`}
                        >
                          Browser Anda tidak mendukung pemutar video HTML5.
                        </video>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}

            {/* Tombol Lanjut ke Kuis */}
            <div className="pt-4 flex justify-end">
              <Button size="lg" onClick={() => setActiveTab('kuis')} className="gap-2 font-bold px-6 shadow">
                Lanjut ke Soal Kuis Evaluasi <FileQuestion className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* TAB 2: KUIS EVALUASI (TANPA BOCORAN KUNCI JAWABAN) */}
          <TabsContent value="kuis" className="space-y-6 pt-4">
            {totalQuestions === 0 ? (
              <Card className="p-8 text-center text-muted-foreground border-dashed">
                Tidak ada pertanyaan kuis pada sesi ini.
              </Card>
            ) : (
              <>
                {/* Progress Bar Kuis */}
                <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Progres Pengerjaan Soal:</span>
                    <span className="text-primary">{answeredCount} dari {totalQuestions} Soal Terjawab</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>

                {/* Score Banner Jika Selesai Submit */}
                {isSubmitted && (
                  <Card className={`border-2 ${isPassed ? 'border-emerald-500 bg-emerald-500/10' : 'border-destructive bg-destructive/10'}`}>
                    <CardContent className="p-6 text-center space-y-3">
                      <div className="inline-flex p-3 rounded-full bg-background shadow-sm">
                        {isPassed ? (
                          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                        ) : (
                          <XCircle className="h-10 w-10 text-destructive" />
                        )}
                      </div>
                      <h3 className="text-2xl font-black">
                        {isPassed ? '?? Selamat! Anda LULUS Sesi Ini' : '?? Nilai Anda Belum Memenuhi Standar KKM'}
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        {isPassed
                          ? `Anda berhasil menjawab ${correctCount} dari ${totalQuestions} soal dengan benar (${quizScore}%). Hasil telah tersimpan di database.`
                          : `Anda mendapatkan skor ${quizScore}% (${correctCount} dari ${totalQuestions} soal benar). Standar kelulusan adalah 70%. Silakan pelajari kembali materi dan ulangi kuis.`}
                      </p>
                      <div className="text-3xl font-extrabold text-foreground pt-1">
                        Skor Akhir: <span className={isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}>{quizScore}%</span>
                      </div>

                      <div className="pt-3 flex flex-wrap gap-3 justify-center">
                        {!isPassed ? (
                          <Button onClick={handleRetakeQuiz} variant="default" className="gap-2 font-bold shadow">
                            <RotateCcw className="h-4 w-4" /> Ulangi Pengerjaan Kuis
                          </Button>
                        ) : (
                          <Link to={`/modules/${session.module_id}`}>
                            <Button variant="default" className="gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 shadow">
                              Lanjut ke Sesi Berikutnya <ArrowLeft className="h-4 w-4 rotate-180" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Error Banner */}
                {submitError && (
                  <div className="p-3 rounded-lg bg-destructive/15 text-destructive text-sm font-medium border border-destructive/30 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {submitError}
                  </div>
                )}

                {/* Daftar Soal (KUNCI JAWABAN TIDAK DIBOCORKAN) */}
                <div className="space-y-6">
                  {session.questions.map((q, qIndex) => {
                    const selectedOptId = selectedAnswers[q.id]

                    return (
                      <Card key={q.id} className="border-border/80 shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/20 border-b pb-3">
                          <div className="flex justify-between items-start gap-3">
                            <CardTitle className="text-base font-bold leading-snug">
                              Soal #{qIndex + 1}: {q.question_text}
                            </CardTitle>
                            <Badge variant="outline" className="shrink-0 font-mono text-xs">
                              {q.points} Poin
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3">
                          <div className="grid grid-cols-1 gap-2.5">
                            {q.options.map((opt) => {
                              const isSelected = selectedOptId === opt.id

                              let optionStyle = 'border-border/60 hover:bg-muted/40'
                              if (isSubmitted) {
                                if (isSelected) {
                                  optionStyle = isPassed
                                    ? 'border-emerald-500 bg-emerald-500/10 font-semibold ring-1 ring-emerald-500'
                                    : 'border-primary bg-primary/10 font-semibold ring-1 ring-primary'
                                } else {
                                  optionStyle = 'opacity-60 border-border/40'
                                }
                              } else if (isSelected) {
                                optionStyle = 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                              }

                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  disabled={isSubmitted && isPassed}
                                  onClick={() => handleSelectOption(q.id, opt.id)}
                                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between text-sm ${optionStyle}`}
                                >
                                  <span>{opt.option_text}</span>
                                  {isSelected && (
                                    <span className="text-xs font-semibold text-primary ml-2 px-2 py-0.5 rounded bg-primary/15 shrink-0">
                                      Pilihan Anda
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Tombol Submit Kuis */}
                {!isSubmitted && (
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t">
                    <div className="text-xs text-muted-foreground">
                      Terjawab: <strong className="text-foreground">{answeredCount}</strong> dari {totalQuestions} Soal
                    </div>
                    <Button
                      size="lg"
                      onClick={handleSubmitQuiz}
                      disabled={answeredCount < totalQuestions || isSubmitting}
                      className="w-full sm:w-auto font-bold px-8 shadow"
                    >
                      {isSubmitting ? 'Memproses Evaluasi...' : 'Kirim Jawaban & Selesaikan Sesi'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  )
}
