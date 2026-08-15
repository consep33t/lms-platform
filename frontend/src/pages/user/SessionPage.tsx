import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  XCircle,
  PlayCircle,
  FileText,
  Award,
  ChevronRight,
  RotateCcw
} from 'lucide-react'
import api from '@/lib/api'

interface ContentItem {
  id: number
  session_id: number
  order: number
  content_type: 'text' | 'image' | 'video' | 'document' | 'embed'
  text_body: string | null
  media_file_id: number | null
}

interface QuestionOptionItem {
  id: number
  question_id: number
  option_text: string
  order: number
  is_correct?: boolean
}

interface QuestionItem {
  id: number
  session_id: number
  question_text: string
  explanation: string | null
  points: number
  order: number
  options: QuestionOptionItem[]
}

interface SessionDetail {
  id: number
  module_id: number
  title: string
  description: string | null
  order: number
  duration_minutes: number
  contents: ContentItem[]
  questions: QuestionItem[]
}

export default function SessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [session, setSession] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'material' | 'quiz'>('material')

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState<number>(0)
  const [isPassed, setIsPassed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchSession()
    // Reset quiz state on session switch
    setSelectedAnswers({})
    setIsSubmitted(false)
    setQuizScore(null)
    setActiveTab('material')
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

  const handleSelectOption = (questionId: number, optionId: number) => {
    if (isSubmitted) return
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }))
  }

  const handleSubmitQuiz = () => {
    if (!session?.questions || session.questions.length === 0) return

    setIsSubmitting(true)
    let correct = 0
    const total = session.questions.length

    session.questions.forEach(q => {
      const selected = selectedAnswers[q.id]
      // Check against option is_correct or fallback to first correct found
      const correctOpt = q.options.find(o => o.is_correct === true)
      if (correctOpt && selected === correctOpt.id) {
        correct++
      } else if (!correctOpt && selected !== undefined) {
        // Default evaluation if client mock
        correct++
      }
    })

    const score = Math.round((correct / total) * 100)
    const passed = score >= 70

    setCorrectCount(correct)
    setQuizScore(score)
    setIsPassed(passed)
    setIsSubmitted(true)
    setIsSubmitting(false)

    // Save session completion to localStorage
    if (passed) {
      localStorage.setItem(`session_completed_${id}`, 'true')
    }
  }

  const handleRetakeQuiz = () => {
    setSelectedAnswers({})
    setIsSubmitted(false)
    setQuizScore(null)
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-12 text-center text-muted-foreground">
          Memuat sesi pembelajaran...
        </div>
      </PageLayout>
    )
  }

  if (!session) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
          <p className="text-muted-foreground">Sesi tidak ditemukan.</p>
          <Button onClick={() => navigate('/')}>Kembali ke Katalog</Button>
        </div>
      </PageLayout>
    )
  }

  const totalQuestions = session.questions?.length || 0
  const answeredCount = Object.keys(selectedAnswers).length
  const progressPercent = totalQuestions > 0
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 100

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to={`/modules/${session.module_id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Modul
          </Link>

          <Badge variant="outline" className="font-mono text-xs">
            Durasi: ~{session.duration_minutes} Menit
          </Badge>
        </div>

        {/* Header Sesi */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-primary/90">Sesi #{session.order}</Badge>
              {isPassed && (
                <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Selesai
                </Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {session.title}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {session.description || 'Pelajari seluruh materi teks, video, dan kerjakan kuis evaluasi.'}
            </p>
          </div>

          <div className="w-full md:w-56 space-y-1.5 bg-muted/40 p-3 rounded-xl border">
            <div className="flex justify-between text-xs font-semibold">
              <span>Progres Sesi</span>
              <span className="text-primary">{isPassed ? '100%' : `${progressPercent}%`}</span>
            </div>
            <Progress value={isPassed ? 100 : progressPercent} className="h-2" />
          </div>
        </div>

        {/* Tabs: Materi vs Kuis */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md h-11 p-1 bg-muted">
            <TabsTrigger value="material" className="font-semibold gap-2">
              <BookOpen className="h-4 w-4" /> Materi Pembelajaran
            </TabsTrigger>
            <TabsTrigger value="quiz" className="font-semibold gap-2">
              <HelpCircle className="h-4 w-4" /> Kuis Evaluasi ({totalQuestions})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: MATERI PEMBELAJARAN */}
          <TabsContent value="material" className="space-y-6">
            {(!session.contents || session.contents.length === 0) ? (
              <Card className="p-8 text-center text-muted-foreground">
                Materi teks dan video untuk sesi ini sedang dipersiapkan.
              </Card>
            ) : (
              session.contents.map((content, idx) => (
                <Card key={content.id} className="overflow-hidden border-border/80 shadow-sm">
                  <CardHeader className="bg-muted/30 border-b py-3 px-5">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {content.content_type === 'video' && <PlayCircle className="h-4 w-4 text-primary" />}
                      {content.content_type === 'image' && <FileText className="h-4 w-4 text-blue-500" />}
                      {content.content_type === 'text' && <BookOpen className="h-4 w-4 text-emerald-500" />}
                      <span>Bagian {idx + 1}: {content.content_type.toUpperCase()}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-4">
                    {/* Render Video Content */}
                    {content.content_type === 'video' && content.media_file_id && (
                      <div className="space-y-3">
                        <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center relative shadow-inner">
                          <video
                            controls
                            className="w-full h-full object-contain"
                            poster={`/api/v1/media/${content.media_file_id}/stream`}
                          >
                            <source src={`/api/v1/media/${content.media_file_id}/stream`} type="video/mp4" />
                            Browser Anda tidak mendukung tag video HTML5.
                          </video>
                        </div>
                        <p className="text-xs text-center text-muted-foreground">
                          ?? Tonton video hingga selesai untuk melengkapi pemahaman materi sesi.
                        </p>
                      </div>
                    )}

                    {/* Render Image Diagram Content */}
                    {content.content_type === 'image' && content.media_file_id && (
                      <div className="space-y-2 text-center">
                        <div className="rounded-xl overflow-hidden border bg-muted/20 p-2 inline-block max-w-full">
                          <img
                            src={`/api/v1/media/${content.media_file_id}/stream`}
                            alt="Diagram Materi"
                            className="max-h-96 w-auto rounded-lg mx-auto object-contain"
                          />
                        </div>
                      </div>
                    )}

                    {/* Render Text Content */}
                    {content.text_body && (
                      <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed whitespace-pre-line text-foreground/90 font-normal">
                        {content.text_body}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}

            {/* Bottom CTA to Quiz */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-bold text-base">Sudah Memahami Seluruh Materi?</h4>
                  <p className="text-xs text-muted-foreground">
                    Lanjutkan ke Kuis Evaluasi ({totalQuestions} Soal) untuk menguji pemahaman dan membuka sesi berikutnya.
                  </p>
                </div>
                <Button onClick={() => setActiveTab('quiz')} className="font-semibold gap-2 shrink-0">
                  Lanjut ke Soal Kuis <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: KUIS EVALUASI */}
          <TabsContent value="quiz" className="space-y-6">
            {totalQuestions === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                Tidak ada soal kuis pada sesi ini.
              </Card>
            ) : (
              <>
                {/* Result Card If Submitted */}
                {isSubmitted && (
                  <Card className={`border-2 ${isPassed ? 'border-emerald-500 bg-emerald-500/10' : 'border-destructive bg-destructive/10'}`}>
                    <CardContent className="p-6 text-center space-y-3">
                      <div className="inline-flex p-3 rounded-full bg-background shadow-sm">
                        {isPassed ? (
                          <Award className="h-8 w-8 text-emerald-600" />
                        ) : (
                          <XCircle className="h-8 w-8 text-destructive" />
                        )}
                      </div>
                      <h3 className="text-2xl font-black">
                        {isPassed ? '?? SELAMAT, ANDA LULUS!' : '? BELUM MEMENUHI STANDAR KELULUSAN'}
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        {isPassed
                          ? `Anda berhasil menjawab ${correctCount} dari ${totalQuestions} soal dengan benar.`
                          : `Skor Anda ${quizScore}%. Minimal nilai kelulusan adalah 70%. Silakan ulangi kuis setelah mempelajari materi kembali.`}
                      </p>
                      <div className="text-4xl font-extrabold font-mono text-foreground">
                        {quizScore}%
                      </div>
                      <div className="pt-2 flex justify-center gap-3">
                        <Button variant="outline" size="sm" onClick={handleRetakeQuiz} className="gap-2">
                          <RotateCcw className="h-4 w-4" /> Ulangi Kuis
                        </Button>
                        {isPassed && (
                          <Button size="sm" onClick={() => navigate(`/modules/${session.module_id}`)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                            Kembali ke Daftar Sesi <ChevronRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* List of Questions */}
                <div className="space-y-6">
                  {session.questions.map((q, qIndex) => {
                    const selectedOptId = selectedAnswers[q.id]
                    return (
                      <Card key={q.id} className="border shadow-sm">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-primary">
                              Soal #{qIndex + 1}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              Bobot: {q.points} Poin
                            </Badge>
                          </div>
                          <CardTitle className="text-base font-semibold pt-1 leading-relaxed">
                            {q.question_text}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="p-5 space-y-2.5">
                          {q.options?.map((opt, optIndex) => {
                            const isSelected = selectedOptId === opt.id
                            const optLetter = String.fromCharCode(65 + optIndex) // A, B, C, D

                            let optionStyle = 'border-border hover:bg-muted/50 hover:border-primary/50'
                            if (isSelected) {
                              optionStyle = 'border-primary bg-primary/10 font-semibold text-primary'
                            }

                            if (isSubmitted) {
                              if (opt.is_correct) {
                                optionStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold'
                              } else if (isSelected && !opt.is_correct) {
                                optionStyle = 'border-destructive bg-destructive/15 text-destructive font-semibold'
                              }
                            }

                            return (
                              <div
                                key={opt.id}
                                onClick={() => handleSelectOption(q.id, opt.id)}
                                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${optionStyle}`}
                              >
                                <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                }`}>
                                  {optLetter}
                                </div>
                                <div className="text-sm flex-1 leading-normal">
                                  {opt.option_text}
                                </div>
                                {isSubmitted && opt.is_correct && (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                                )}
                                {isSubmitted && isSelected && !opt.is_correct && (
                                  <XCircle className="h-5 w-5 text-destructive shrink-0" />
                                )}
                              </div>
                            )
                          })}

                          {/* Explanation if submitted */}
                          {isSubmitted && q.explanation && (
                            <div className="mt-4 p-3.5 rounded-xl bg-muted/60 border border-muted text-xs leading-relaxed space-y-1">
                              <span className="font-bold text-foreground">?? Pembahasan:</span>
                              <p className="text-muted-foreground">{q.explanation}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Submit Button */}
                {!isSubmitted && (
                  <div className="p-4 rounded-xl bg-card border shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4">
                    <div className="text-xs text-muted-foreground">
                      Terjawab: <strong className="text-foreground">{answeredCount}</strong> dari {totalQuestions} Soal
                    </div>
                    <Button
                      size="lg"
                      onClick={handleSubmitQuiz}
                      disabled={answeredCount < totalQuestions || isSubmitting}
                      className="w-full sm:w-auto font-bold px-8 shadow"
                    >
                      {isSubmitting ? 'Memeriksa...' : 'Kirim Jawaban & Selesaikan Sesi'}
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
