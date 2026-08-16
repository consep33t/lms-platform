import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  FileQuestion,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  PlayCircle,
  FileText,
  Clock,
  Sparkles,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Award,
  Layers,
  MessageSquare,
  Bot
} from 'lucide-react'
import api from '@/lib/api'
import { RichContentRenderer } from '@/components/common/RichContentRenderer'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ActiveLearnerPresence } from '@/components/realtime/ActiveLearnerPresence'
import { AITutorChatDrawer } from '@/components/ai/AITutorChatDrawer'
import { AIQuestionExplanationModal } from '@/components/quiz/AIQuestionExplanationModal'
import { usePageTitle } from '@/hooks/usePageTitle'

function BadgeCelebrationModal({ score, onClose }: { score: number, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border-2 border-emerald-500 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center animate-in zoom-in duration-500">
        <Award className="h-20 w-20 text-emerald-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-black text-foreground mb-2">Sesi Selesai!</h2>
        <p className="text-muted-foreground mb-6">Luar biasa! Anda mendapatkan skor {Math.round(score)}%.</p>
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={onClose}>Lanjutkan</Button>
      </div>
    </div>
  )
}

function SessionNotesDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-background border-l shadow-2xl p-6 overflow-y-auto transform transition-transform animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2"><FileText className="h-5 w-5"/> Catatan Sesi</h3>
        <Button variant="ghost" size="sm" onClick={onClose}><XCircle className="h-5 w-5"/></Button>
      </div>
      <textarea 
        className="w-full h-[calc(100vh-150px)] p-4 rounded-xl border bg-muted/20 focus:ring-2 focus:ring-primary focus:outline-none resize-none" 
        placeholder="Tulis catatan Anda di sini... (otomatis tersimpan lokal)"
      />
    </div>
  )
}

function SessionDiscussionTab() {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-card border rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold mb-4">Forum Diskusi Sesi (Q&A)</h3>
        <textarea 
          className="w-full p-4 rounded-xl border bg-muted/20 focus:ring-2 focus:ring-primary focus:outline-none resize-none mb-3" 
          placeholder="Ada pertanyaan mengenai materi di sesi ini? Tulis di sini..."
          rows={3}
        />
        <Button className="font-bold">Kirim Pertanyaan</Button>
      </div>
      <div className="space-y-4">
        <div className="p-4 border rounded-xl bg-muted/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">U</div>
            <div>
              <div className="text-sm font-bold">User123</div>
              <div className="text-xs text-muted-foreground">2 jam yang lalu</div>
            </div>
          </div>
          <p className="text-sm">Bagaimana cara menerapkan konsep ini pada proyek nyata?</p>
        </div>
      </div>
    </div>
  )
}

interface OptionItem {
  id: number
  question_id: number
  option_text: string
  order: number
}

interface QuestionItem {
  id: number
  session_id: number
  question_text: string
  question_type?: string
  points: number
  order: number
  options: OptionItem[]
  meta_data?: any
}

interface SlideItem {
  id: number
  step_number: number
  step_type: 'text' | 'image' | 'video' | 'quiz'
  title: string
  text_body?: string
  media_file_id?: number
  quiz_group_id?: number
  quiz_weight_percent: number
  questions: QuestionItem[]
}

interface SessionDetailData {
  id: number
  module_id: number
  title: string
  description?: string
  duration_minutes: number
  steps: SlideItem[]
  total_steps: number
  total_quizzes: number
  duration_seconds: number
  remaining_seconds: number
  is_expired: boolean
  current_step: number
  completed_percent: number
  accumulated_score: number
  is_completed: boolean
}

export default function SessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [session, setSession] = useState<SessionDetailData | null>(null)
  usePageTitle(session?.title ? `${session.title}` : 'Sesi Belajar Interaktif')
  const [loading, setLoading] = useState(true)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  // Timer State
  const [secondsLeft, setSecondsLeft] = useState<number>(1800)
  const [isTimedOut, setIsTimedOut] = useState(false)
  const [timeoutMessage, setTimeoutMessage] = useState<string | null>(null)

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, any>>({})
  const [accumulatedScore, setAccumulatedScore] = useState<number>(0)
  const [isFinished, setIsFinished] = useState(false)
  const [isSubmittingStep, setIsSubmittingStep] = useState(false)

  // Anti-Cheat State
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [antiCheatWarning, setAntiCheatWarning] = useState<string | null>(null)

  // Gamification & Features
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false)
  const [isAITutorOpen, setIsAITutorOpen] = useState(false)
  const [explanationQuestion, setExplanationQuestion] = useState<string | null>(null)

  // Load Session Data
  useEffect(() => {
    fetchSessionData()
  }, [id])

  // Anti-Cheat Tab-Switch Detection
  useEffect(() => {
    if (loading || isFinished || isTimedOut) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const nextCount = prev + 1
          setAntiCheatWarning(`⚠️ Peringatan Anti-Cheat (${nextCount}/3): Anda terdeteksi berpindah tab! Aktivitas ini dicatat dalam log integritas ujian.`)
          api.post(`/sessions/${id}/flag?flag_type=tab_switch`).catch((err) => {
            console.error('Failed to report anti-cheat flag', err)
          })
          setTimeout(() => setAntiCheatWarning(null), 6000)
          return nextCount
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [id, loading, isFinished, isTimedOut])


  const fetchSessionData = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/sessions/${id}`)
      const data: SessionDetailData = res.data
      setSession(data)
      setSecondsLeft(data.remaining_seconds)
      setAccumulatedScore(data.accumulated_score || 0)
      if (data.is_completed) {
        setIsFinished(true)
      } else if (data.is_expired) {
        setIsTimedOut(true)
        setTimeoutMessage(`Batas waktu sesi (${data.duration_minutes} menit) telah berakhir.`)
      }
    } catch (err) {
      console.error('Failed to load session flow detail', err)
    } finally {
      setLoading(false)
    }
  }

  // Countdown Timer Interval
  useEffect(() => {
    if (loading || isFinished || isTimedOut) return

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleTimeExpired()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [loading, isFinished, isTimedOut])

  const handleTimeExpired = async () => {
    if (isFinished || isTimedOut) return
    setIsTimedOut(true)
    try {
      const res = await api.post(`/sessions/${id}/timeout`, {
        current_step: currentStepIndex + 1,
        total_steps: session?.steps?.length || 1,
        time_spent_seconds: (session?.duration_seconds || 1800) - secondsLeft
      })
      setTimeoutMessage(res.data.message)
    } catch (err) {
      console.error('Timeout handler error', err)
      setTimeoutMessage('Batas waktu pengerjaan sesi telah habis. Progres Anda telah dicatat.')
    }
  }

  const handleSelectOption = (questionId: number, optionId: number) => {
    if (isTimedOut || isFinished) return
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const handleToggleOption = (questionId: number, optionId: number) => {
    if (isTimedOut || isFinished) return
    setSelectedAnswers((prev) => {
      const current = prev[questionId] || []
      const isSelected = current.includes(optionId)
      const next = isSelected ? current.filter((id: number) => id !== optionId) : [...current, optionId]
      return { ...prev, [questionId]: next }
    })
  }

  const handleTextAnswer = (questionId: number, text: string) => {
    if (isTimedOut || isFinished) return
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: text }))
  }

  const handleNextStep = async () => {
    if (!session || !session.steps) return
    const currentStep = session.steps[currentStepIndex]

    // If current step is a quiz, submit the quiz step answers first
    if (currentStep.step_type === 'quiz' && currentStep.questions.length > 0) {
      const stepAnswers = currentStep.questions.map((q) => {
        const val = selectedAnswers[q.id]
        let selectedOptionId = null
        let selectedOptionIds = null
        let textAnswer = null
        
        if (typeof val === 'number') selectedOptionId = val
        else if (Array.isArray(val)) selectedOptionIds = val
        else if (typeof val === 'string') textAnswer = val
        else if (q.question_type === 'multiple_choice') selectedOptionId = 0
        else if (q.question_type === 'multi_select') selectedOptionIds = []
        else textAnswer = ''
        
        return {
          question_id: q.id,
          selected_option_id: selectedOptionId,
          selected_option_ids: selectedOptionIds,
          text_answer: textAnswer
        }
      })

      try {
        setIsSubmittingStep(true)
        const res = await api.post(`/sessions/${id}/quiz-step`, {
          quiz_group_id: currentStep.quiz_group_id || 1,
          answers: stepAnswers,
          time_spent_seconds: 30,
          current_step: currentStepIndex + 1
        })
        setAccumulatedScore(res.data.total_accumulated_score)
      } catch (err) {
        console.error('Failed to submit quiz step', err)
      } finally {
        setIsSubmittingStep(false)
      }
    }

    // Advance to next step or complete session
    if (currentStepIndex < session.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    } else {
      handleCompleteSession()
    }
  }

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  const handleCompleteSession = async () => {
    if (!session) return
    try {
      setIsSubmittingStep(true)
      const allAnswersPayload = Object.entries(selectedAnswers).map(([qId, val]) => {
        let selectedOptionId = null
        let selectedOptionIds = null
        let textAnswer = null
        
        if (typeof val === 'number') selectedOptionId = val
        else if (Array.isArray(val)) selectedOptionIds = val
        else if (typeof val === 'string') textAnswer = val

        return {
          question_id: parseInt(qId),
          selected_option_id: selectedOptionId,
          selected_option_ids: selectedOptionIds,
          text_answer: textAnswer
        }
      })

      const res = await api.post(`/sessions/${id}/submit`, {
        session_id: session.id,
        answers: allAnswersPayload,
        time_spent_seconds: session.duration_seconds - secondsLeft,
        current_step: session.steps.length
      })

      setAccumulatedScore(res.data.score)
      setIsFinished(true)
      if (res.data.score >= 70.0) {
        setShowBadgeCelebration(true)
      }
    } catch (err) {
      console.error('Failed to complete session', err)
    } finally {
      setIsSubmittingStep(false)
    }
  }

  const handleRetakeSession = () => {
    setSelectedAnswers({})
    setCurrentStepIndex(0)
    setIsFinished(false)
    setIsTimedOut(false)
    setTimeoutMessage(null)
    fetchSessionData()
  }

  // Timer Formatter (MM:SS)
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-20 text-center space-y-3">
          <div className="animate-spin h-9 w-9 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground text-sm font-medium">Menyiapkan alur slide pembelajaran...</p>
        </div>
      </PageLayout>
    )
  }

  if (!session || !session.steps || session.steps.length === 0) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
          <p className="text-muted-foreground">Materi slide pembelajaran belum tersedia.</p>
          <Button onClick={() => navigate('/')}>Kembali ke Katalog</Button>
        </div>
      </PageLayout>
    )
  }

  const steps = session.steps
  const currentStep = steps[currentStepIndex]
  const totalSteps = steps.length
  const stepPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100)
  const isPassed = accumulatedScore >= 70.0

  // Timer Color Styling
  const isUrgent = secondsLeft < 300 // < 5 mins
  const isCritical = secondsLeft < 60 // < 1 min

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* TOP BAR: Navigasi & Live Countdown Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border bg-card/60 backdrop-blur shadow-sm">
          <div className="flex items-center gap-2">
            <Link to={`/modules/${session.module_id}`}>
              <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Keluar ke Modul
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsNotesOpen(true)}>
              <FileText className="h-4 w-4" /> Catatan
            </Button>
            <Button variant="outline" size="sm" className="gap-2 border-primary/50 text-primary hover:bg-primary/10" onClick={() => setIsAITutorOpen(true)}>
              <Bot className="h-4 w-4" /> AI Tutor
            </Button>
          </div>

          {/* Live Countdown Timer Pill */}
          <div className="flex items-center gap-3">
            <ActiveLearnerPresence count={42} />
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono font-bold text-sm border shadow-inner transition-colors ${
                isTimedOut
                  ? 'bg-destructive/15 text-destructive border-destructive/40'
                  : isCritical
                  ? 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500 animate-pulse'
                  : isUrgent
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              }`}
            >
              <Clock className="h-4 w-4 shrink-0" />
              <span>{isTimedOut ? 'WAKTU HABIS' : `Sisa Waktu: ${formatTimer(secondsLeft)}`}</span>
            </div>

            {/* Skor Sementara */}
            <Badge variant="outline" className="text-xs font-semibold px-3 py-1 bg-muted/40">
              Skor: <span className="text-primary font-bold ml-1">{Math.round(accumulatedScore)}%</span>
            </Badge>
          </div>
        </div>

        {/* PROGRES BAR SLIDE */}
        <div className="space-y-2 px-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground">
              Slide <strong className="text-foreground">{currentStepIndex + 1}</strong> dari {totalSteps}
            </span>
            <span className="text-primary font-bold">{stepPercent}% Selesai</span>
          </div>
          <Progress value={stepPercent} className="h-2.5 rounded-full" />
        </div>

        {/* ANTI-CHEAT ALERT BANNER */}
        {antiCheatWarning && (
          <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-medium">{antiCheatWarning}</span>
          </div>
        )}

        {/* BANNER TIMEOUT JIKA WAKTU HABIS */}
        {isTimedOut && !isFinished && (
          <Card className="border-2 border-destructive bg-destructive/10 overflow-hidden shadow-lg animate-in fade-in zoom-in duration-300">
            <CardContent className="p-6 text-center space-y-4">
              <div className="inline-flex p-3 rounded-full bg-destructive/20 text-destructive">
                <AlertTriangle className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-black text-destructive tracking-tight">
                ? Batas Waktu Sesi Telah Berakhir!
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {timeoutMessage || `Batas waktu pengerjaan sesi (${session.duration_minutes} menit) telah berakhir. Sistem secara otomatis mencatat penyelesaian slide dan akumulasi skor kuis Anda.`}
              </p>
              <div className="p-4 rounded-xl bg-background/80 border max-w-md mx-auto grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xs text-muted-foreground">Penyelesaian Slide</div>
                  <div className="text-xl font-extrabold text-foreground">{stepPercent}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Skor Kuis Terkumpul</div>
                  <div className="text-xl font-extrabold text-primary">{Math.round(accumulatedScore)}%</div>
                </div>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Button onClick={handleRetakeSession} variant="default" className="gap-2 font-bold">
                  <RotateCcw className="h-4 w-4" /> Ulangi Sesi dari Awal
                </Button>
                <Link to={`/modules/${session.module_id}`}>
                  <Button variant="outline" className="font-semibold">
                    Kembali ke Modul
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* BANNER HASIL AKHIR KELULUSAN SESI */}
        {isFinished && (
          <Card className={`border-2 shadow-xl ${isPassed ? 'border-emerald-500 bg-emerald-500/10' : 'border-destructive bg-destructive/10'}`}>
            <CardContent className="p-8 text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-background shadow-md">
                {isPassed ? (
                  <Award className="h-12 w-12 text-emerald-500" />
                ) : (
                  <XCircle className="h-12 w-12 text-destructive" />
                )}
              </div>
              <h2 className="text-3xl font-black tracking-tight">
                {isPassed ? '?? Selamat! Anda LULUS Sesi Ini' : '?? Nilai Belum Memenuhi KKM'}
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {isPassed
                  ? `Luar biasa! Anda telah menyelesaikan 100% slide pembelajaran dengan skor akhir ${Math.round(accumulatedScore)}%. Hasil telah tersimpan permanen di database.`
                  : `Anda menyelesaikan sesi dengan skor ${Math.round(accumulatedScore)}% (KKM: 70%). Silakan pelajari kembali slide materi dan ulangi evaluasi kuis.`}
              </p>

              <div className="text-4xl font-black text-foreground pt-2">
                Skor Akhir: <span className={isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}>{Math.round(accumulatedScore)}%</span>
              </div>

              <div className="pt-4 flex flex-wrap gap-3 justify-center">
                {!isPassed ? (
                  <Button onClick={handleRetakeSession} variant="default" className="gap-2 font-bold shadow">
                    <RotateCcw className="h-4 w-4" /> Ulangi Pengerjaan Sesi
                  </Button>
                ) : (
                  <Link to={`/modules/${session.module_id}`}>
                    <Button variant="default" className="gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md">
                      Lanjut ke Sesi Berikutnya <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AREA UTAMA KONTEN SLIDE / KUIS BERURUTAN */}
        {!isFinished && !isTimedOut && (
          <Tabs defaultValue="materi" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
              <TabsTrigger value="materi" className="gap-2"><BookOpen className="w-4 h-4" /> Materi & Konten</TabsTrigger>
              <TabsTrigger value="diskusi" className="gap-2"><MessageSquare className="w-4 h-4" /> Diskusi Sesi (Q&A)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="materi" className="mt-0">
              <Card className="border-border/80 shadow-md overflow-hidden transition-all duration-300">
                {/* Header Slide */}
                <CardHeader className="bg-muted/20 border-b pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {currentStep.step_type === 'text' && <FileText className="h-5 w-5 text-primary" />}
                  {currentStep.step_type === 'image' && <Sparkles className="h-5 w-5 text-emerald-500" />}
                  {currentStep.step_type === 'video' && <PlayCircle className="h-5 w-5 text-blue-500" />}
                  {currentStep.step_type === 'quiz' && <FileQuestion className="h-5 w-5 text-amber-500" />}
                  <CardTitle className="text-base md:text-lg font-bold">
                    {currentStep.title}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="shrink-0 text-xs uppercase tracking-wider font-mono font-semibold">
                  {currentStep.step_type}
                </Badge>
              </div>
            </CardHeader>

            {/* Body Slide */}
            <CardContent className="p-6 md:p-8 space-y-6">
              {/* TIPE 1: KONTEN TEKS & RICH CODE/TERMINAL */}
              {currentStep.step_type === 'text' && currentStep.text_body && (
                <div className="prose dark:prose-invert max-w-none text-base md:text-lg leading-relaxed text-foreground/90 font-normal">
                  <RichContentRenderer content={currentStep.text_body} />
                </div>
              )}

              {/* TIPE 2: GAMBAR / DIAGRAM HIGH-RES */}
              {currentStep.step_type === 'image' && currentStep.media_file_id && (
                <div className="space-y-3">
                  <div className="rounded-2xl overflow-hidden border bg-black/5 flex items-center justify-center p-2 shadow-inner">
                    <img
                      src={`/api/v1/media/${currentStep.media_file_id}/stream`}
                      alt={currentStep.title}
                      className="max-h-[520px] w-auto object-contain rounded-xl shadow-sm"
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground font-medium">
                    Diagram Arsitektur Sistem Beresolusi Tinggi (Dianalisis & Disimpan di Media Storage)
                  </p>
                </div>
              )}

              {/* TIPE 3: VIDEO PEMBELAJARAN STREAMING HTTP 206 */}
              {currentStep.step_type === 'video' && currentStep.media_file_id && (
                <div className="space-y-3">
                  <div className="rounded-2xl overflow-hidden border bg-black shadow-lg">
                    <video
                      controls
                      controlsList="nodownload"
                      playsInline
                      preload="metadata"
                      className="w-full max-h-[500px] aspect-video object-contain"
                      src={`/api/v1/media/${currentStep.media_file_id}/stream`}
                    >
                      Browser Anda tidak mendukung pemutar video HTML5.
                    </video>
                  </div>
                  <p className="text-xs text-center text-muted-foreground font-medium">
                    Demonstrasi Teknis Langsung  Didukung HTTP 206 Partial Content Chunked Streaming
                  </p>
                </div>
              )}

              {/* TIPE 4: CHECKPOINT KUIS DI SELA-SELA SLIDE */}
              {currentStep.step_type === 'quiz' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs md:text-sm font-medium leading-relaxed">
                    ?? <strong>Evaluasi Pemahaman Checkpoint:</strong> Kuis ini memiliki bobot <strong>{currentStep.quiz_weight_percent}%</strong> dari total nilai sesi. Jika terdapat jawaban salah, skor akan dibagi secara proporsional dari jumlah butir soal kuis ini.
                  </div>

                  {currentStep.questions.map((q, qIdx) => {
                    const qType = q.question_type || 'multiple_choice'

                    return (
                      <div key={q.id} className="space-y-3 p-5 rounded-xl border bg-muted/10">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-base font-bold text-foreground leading-snug">
                            {q.question_text}
                          </div>
                          <Badge variant="secondary" className="shrink-0 text-[10px] uppercase">
                            {qType.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="pt-2">
                          {qType === 'multiple_choice' && (
                            <div className="grid grid-cols-1 gap-2.5">
                              {q.options.map((opt) => {
                                const isSelected = selectedAnswers[q.id] === opt.id
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleSelectOption(q.id, opt.id)}
                                    className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between ${
                                      isSelected
                                        ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                                        : 'border-border/60 hover:bg-muted/40 text-foreground/90'
                                    }`}
                                  >
                                    <span>{opt.option_text}</span>
                                    {isSelected && (
                                      <span className="text-xs font-semibold text-primary px-2 py-0.5 rounded bg-primary/15 shrink-0">
                                        Pilihan Anda
                                      </span>
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          )}

                          {qType === 'multi_select' && (
                            <div className="grid grid-cols-1 gap-2.5">
                              {q.options.map((opt) => {
                                const selectedArr = selectedAnswers[q.id] || []
                                const isSelected = selectedArr.includes(opt.id)
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleToggleOption(q.id, opt.id)}
                                    className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between ${
                                      isSelected
                                        ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary'
                                        : 'border-border/60 hover:bg-muted/40 text-foreground/90'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                        {isSelected && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                                      </div>
                                      <span>{opt.option_text}</span>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          )}

                          {qType === 'essay' && (
                            <textarea
                              className="w-full p-4 rounded-xl border bg-background text-sm min-h-[120px] focus:ring-2 focus:ring-primary focus:outline-none"
                              placeholder="Ketik jawaban essay Anda di sini..."
                              value={selectedAnswers[q.id] || ''}
                              onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                            />
                          )}

                          {qType === 'code' && (
                            <textarea
                              className="w-full p-4 rounded-xl border bg-slate-950 text-slate-100 font-mono text-sm min-h-[200px] focus:ring-2 focus:ring-primary focus:outline-none leading-relaxed"
                              placeholder="/* Tulis kode Anda di sini */"
                              value={selectedAnswers[q.id] || (q.meta_data?.template || '')}
                              onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                            />
                          )}
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30 gap-1 text-xs font-semibold"
                            onClick={() => setExplanationQuestion(q.question_text)}
                          >
                            <Sparkles className="h-3 w-3" /> Tanya AI Penjelasan
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>

            {/* Footer Navigasi Slide */}
            <CardFooter className="bg-muted/10 border-t p-4 flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0 || isSubmittingStep}
                className="gap-2 font-semibold"
              >
                <ArrowLeft className="h-4 w-4" /> Sebelumnya
              </Button>

              <div className="text-xs text-muted-foreground hidden sm:inline font-medium">
                {currentStep.step_type === 'quiz' ? 'Selesaikan kuis untuk melanjutkan' : 'Pelajari slide lalu klik Lanjut'}
              </div>

              <Button
                onClick={handleNextStep}
                disabled={
                  isSubmittingStep ||
                  (currentStep.step_type === 'quiz' &&
                    currentStep.questions.some((q) => !selectedAnswers[q.id] || (Array.isArray(selectedAnswers[q.id]) && selectedAnswers[q.id].length === 0)))
                }
                className="gap-2 font-bold px-6 shadow-sm"
              >
                {isSubmittingStep ? (
                  'Memproses...'
                ) : currentStepIndex === totalSteps - 1 ? (
                  <>Selesaikan Sesi Pembelajaran <CheckCircle2 className="h-4 w-4" /></>
                ) : currentStep.step_type === 'quiz' ? (
                  <>Simpan Jawaban & Lanjut <ArrowRight className="h-4 w-4" /></>
                ) : (
                  <>Lanjut ke Slide Berikutnya <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="diskusi" className="mt-0">
              <SessionDiscussionTab />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {showBadgeCelebration && (
        <BadgeCelebrationModal score={accumulatedScore} onClose={() => setShowBadgeCelebration(false)} />
      )}
      
      <SessionNotesDrawer isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} />
      <AITutorChatDrawer isOpen={isAITutorOpen} onClose={() => setIsAITutorOpen(false)} />
      <AIQuestionExplanationModal 
        isOpen={!!explanationQuestion} 
        onClose={() => setExplanationQuestion(null)} 
        question={explanationQuestion || ''} 
      />
    </PageLayout>
  )
}
