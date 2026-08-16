import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import {
  Server,
  ShieldCheck,
  Zap,
  Layers,
  Database,
  Cpu,
  Video,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Users,
  Code2
} from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function AboutPage() {
  usePageTitle('Tentang Platform & Arsitektur Enterprise')
  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto space-y-10 pb-16">
        {/* Hero Banner */}
        <div className="text-center space-y-4 pt-4">
          <Badge variant="outline" className="px-3.5 py-1 text-xs font-semibold tracking-wide uppercase border-primary/40 text-primary bg-primary/5">
            Enterprise Learning Management System � v1.4.0
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Tentang <span className="text-primary">LMS Platform</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Platform pembelajaran daring kelas enterprise yang dirancang untuk performa tinggi, skalabilitas tanpa kompromi, dan integritas evaluasi materi yang ketat.
          </p>
        </div>

        {/* 4 Pilar Utama Platform */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/80 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start gap-4 pb-2">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold">Strict Token & Security Access</CardTitle>
                <CardDescription className="text-xs">Pengikatan token akses presisi per modul</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Setiap modul pembelajaran diproteksi oleh token unik terikat. Token untuk modul jaringan tidak dapat digunakan pada modul lain, mencegah akses tidak sah secara komprehensif di tingkat backend.
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start gap-4 pb-2">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Zap className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold">Server-Side Quiz & Anti-Leak</CardTitle>
                <CardDescription className="text-xs">Evaluasi kuis aman tanpa bocoran kunci jawaban</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Evaluasi kuis pilihan ganda diproses sepenuhnya di server-side. Sistem tidak mengekspos kunci jawaban pada response API maupun client-side bundle, menjaga integritas ujian dan pemahaman peserta.
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start gap-4 pb-2">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Video className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold">HTTP 206 Partial Streaming</CardTitle>
                <CardDescription className="text-xs">Streaming video responsif tanpa buffer berlebih</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Didukung oleh Nginx reverse proxy dan MinIO S3 Object Storage dengan mekanisme chunked byte-range streaming (HTTP 206), memungkinkan pemutaran video materi berdefinisi tinggi secara instan tanpa membebani memori server.
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start gap-4 pb-2">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Layers className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold">Live Cumulative Progress Sync</CardTitle>
                <CardDescription className="text-xs">Sinkronisasi status kelulusan real-time dari database</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Menghitung persentase kemajuan modul, sesi yang telah diselesaikan, dan rata-rata nilai kuis secara matematis langsung dari basis data MSSQL, menghilangkan ketergantungan pada mock client-side.
            </CardContent>
          </Card>
        </div>

        {/* Spesifikasi Teknologi Enterprise */}
        <Card className="border-border/80 overflow-hidden shadow-sm">
          <CardHeader className="bg-muted/30 border-b">
            <div className="flex items-center gap-3">
              <Cpu className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg font-bold">Tech Stack & Arsitektur Sistem</CardTitle>
                <CardDescription className="text-xs">Komponen teknologi mutakhir yang digunakan pada platform ini</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl bg-muted/40 border space-y-1.5">
                <Code2 className="h-6 w-6 mx-auto text-primary" />
                <div className="font-bold text-sm">FastAPI</div>
                <div className="text-xs text-muted-foreground">Python 3.11 Async Backend</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border space-y-1.5">
                <Layers className="h-6 w-6 mx-auto text-blue-500" />
                <div className="font-bold text-sm">React 18 & Vite</div>
                <div className="text-xs text-muted-foreground">TypeScript + Tailwind CSS</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border space-y-1.5">
                <Database className="h-6 w-6 mx-auto text-emerald-500" />
                <div className="font-bold text-sm">Microsoft SQL Server</div>
                <div className="text-xs text-muted-foreground">Enterprise Relational DB</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border space-y-1.5">
                <Server className="h-6 w-6 mx-auto text-red-500" />
                <div className="font-bold text-sm">Redis & Celery</div>
                <div className="text-xs text-muted-foreground">Async Worker & Cache</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Author & Footer Note */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border bg-muted/20">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-sm font-bold text-foreground">Dikembangkan untuk Standar Enterprise</div>
            <div className="text-xs text-muted-foreground">
              Hak Cipta � 2026 <strong>consep33t</strong>. Seluruh hak cipta dilindungi undang-undang.
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button size="sm" variant="default" className="font-semibold gap-1.5">
                <BookOpen className="h-4 w-4" /> Mulai Belajar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
