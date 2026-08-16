import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  GraduationCap,
  Sparkles,
  Terminal,
  Code2,
  ShieldCheck,
  Video,
  Award,
  ArrowRight,
  CheckCircle,
  Users,
  Layers,
  Cpu,
  Globe,
  Lock,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  Flame,
  Zap,
  Server,
  Cloud,
  QrCode,
  MessageSquare,
  WifiOff,
  Menu,
  X
} from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useTenant } from '@/context/TenantContext'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { PageTransition } from '@/components/common/PageTransition'

interface CodeTab {
  id: string
  label: string
  filename: string
  language: string
  code: string
  output?: string
}

const CODE_TABS: CodeTab[] = [
  {
    id: 'bash',
    label: 'Linux Bash',
    filename: 'deploy-cluster.sh',
    language: 'bash',
    code: `#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Memulai automated deployment cluster LMS..."
docker compose pull --parallel
docker compose up -d --remove-orphans

# Health check endpoint
curl -fsSL https://lms.consep33t.my.id/health | jq .status
echo "✅ Sistem siap & semua modul aktif!"`,
    output: `[INFO] Initializing container cluster v4.1.0...
[OK] Redis cache connected: OK
[OK] PostgreSQL Async Database: OK
[STATUS] "ok" -> 0 errors detected. Deployment successful!`
  },
  {
    id: 'tsx',
    label: 'React TSX',
    filename: 'LearningSession.tsx',
    language: 'typescript',
    code: `import React, { useState } from 'react'
import { useSessionProgress } from '@/hooks/useSession'

export function InteractiveLab({ sessionId }: { sessionId: string }) {
  const { currentStep, completeStep, isPassed } = useSessionProgress(sessionId)

  return (
    <div className="glass-card p-6 rounded-2xl border border-primary/20">
      <h2 className="text-xl font-bold">Checkpoint Lab #{currentStep}</h2>
      <button 
        onClick={() => completeStep({ codeVerified: true })}
        className="btn-primary hover-lift"
      >
        Validasi & Lanjut Sesi
      </button>
    </div>
  )
}`,
    output: `Compiled successfully in 124ms. Zero TypeScript errors.`
  },
  {
    id: 'docker',
    label: 'Dockerfile',
    filename: 'Dockerfile.production',
    language: 'dockerfile',
    code: `# Multi-stage lightweight enterprise build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline
COPY . .
RUN npm run build

FROM nginx:alpine-slim
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`,
    output: `Step 6/6 : Successfully built container image (size: 24.3MB)`
  },
  {
    id: 'sql',
    label: 'SQL Postgres',
    filename: 'analytics.sql',
    language: 'sql',
    code: `-- Analisis ranking kelulusan dan score leaderboard
SELECT 
  u.id, 
  u.full_name, 
  COUNT(c.id) AS certificates_earned,
  ROUND(AVG(sp.score), 1) AS avg_score
FROM users u
JOIN certificates c ON c.user_id = u.id
JOIN session_progress sp ON sp.user_module_progress_id = c.module_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.full_name
ORDER BY certificates_earned DESC, avg_score DESC
LIMIT 10;`,
    output: `10 rows returned in 4.2ms. Execution cost: 0.08`
  }
]

interface CourseCategory {
  id: string
  title: string
  desc: string
  tag: string
  duration: string
  sessions: number
  level: 'Pemula' | 'Menengah' | 'Lanjutan'
  topics: string[]
}

const COURSES: CourseCategory[] = [
  {
    id: 'cloud-devops',
    title: 'Cloud Infrastructure & DevOps CI/CD',
    desc: 'Penguasaan Docker containerization, automated GitHub Actions pipeline, Linux shell orchestration, dan deployment cloud zero-downtime.',
    tag: 'Cloud & DevOps',
    duration: '12 Jam Belajar',
    sessions: 16,
    level: 'Menengah',
    topics: ['Docker & Multi-Stage Builds', 'GitHub Actions CI/CD Pipeline', 'Reverse Proxy Nginx & SSL', 'System Monitoring & Logs']
  },
  {
    id: 'fullstack-web',
    title: 'Modern Fullstack Architecture & React 18',
    desc: 'Bangun sistem enterprise skalabel dengan FastAPI backend, SQLAlchemy 2.0 async, React TypeScript frontend, dan Tailwind CSS design system.',
    tag: 'Fullstack Web',
    duration: '14 Jam Belajar',
    sessions: 18,
    level: 'Menengah',
    topics: ['FastAPI & Pydantic v2', 'Async SQLAlchemy ORM', 'State Management Zustand', 'Web Performance & Code Splitting']
  },
  {
    id: 'linux-security',
    title: 'Linux Administration & Server Security',
    desc: 'Manajemen sistem operasi Linux, konfigurasi permission, SSH hardening, firewall UFW, automasi cron jobs, dan audit keamanan OWASP.',
    tag: 'Linux & Security',
    duration: '10 Jam Belajar',
    sessions: 14,
    level: 'Pemula',
    topics: ['Linux Bash Shell Scripting', 'User Management & Sudo ACL', 'JWT Auth & Token Rotation', 'Security Headers & Rate Limiting']
  },
  {
    id: 'microservices',
    title: 'Enterprise Multi-Tenancy & SCORM xAPI',
    desc: 'Implementasi arsitektur multi-tenant, Single Sign-On (SAML/OIDC), integrasi paket pembelajaran SCORM 1.2/2004, dan pelacakan xAPI statements.',
    tag: 'Cloud & DevOps',
    duration: '8 Jam Belajar',
    sessions: 10,
    level: 'Lanjutan',
    topics: ['Tenant Isolation & Dynamic Branding', 'SSO IdP Integration', 'SCORM Manifest Parsing', 'Realtime WebSocket Sync']
  }
]

interface FAQItem {
  question: string
  answer: string
}

const FAQS: FAQItem[] = [
  {
    question: 'Bagaimana alur pendaftaran peserta baru?',
    answer: 'Anda dapat mendaftar mandiri melalui form pendaftaran atau menggunakan akun Google. Sistem secara otomatis men-generate alamat Email Resmi LMS (contoh: nama@student.lms.alfanet.id). Setelah disetujui oleh Administrator, Anda dapat langsung masuk dan mengakses seluruh modul praktikum.'
  },
  {
    question: 'Apakah sertifikat yang didapatkan diakui dan dapat diverifikasi publik?',
    answer: 'Ya! Setiap sertifikat kelulusan dilengkapi dengan nomor seri unik dan QR Code dinamis yang terhubung langsung ke portal verifikasi publik (/verify). Siapapun atau institusi perekrut dapat memeriksa keaslian nilai, tanggal kelulusan, dan kompetensi yang diraih secara instan.'
  },
  {
    question: 'Apakah platform ini dapat diakses secara offline?',
    answer: 'Ya. LMS Platform mendukung kapabilitas Progressive Web App (PWA) dengan Service Worker canggih. Anda dapat membuka materi yang telah di-cache saat offline dan progres kuis Anda akan disinkronkan otomatis saat koneksi internet kembali terhubung.'
  },
  {
    question: 'Apakah LMS ini mendukung integrasi multi-tenant untuk institusi atau perusahaan?',
    answer: 'Tentu. Sistem memiliki arsitektur Multi-Tenancy kelas enterprise dengan isolasi data ketat, dynamic branding (logo, nama institusi, dan palet warna kustom), serta dukungan Enterprise Single Sign-On (SAML 2.0 dan OIDC).'
  },
  {
    question: 'Bagaimana format pembelajaran dan praktikum dilakukan?',
    answer: 'Pembelajaran terdiri dari materi teori terstruktur, video demonstrasi dengan HTTP 206 partial streaming, hands-on code runner interaktif dengan syntax highlighting, kuis checkpoint adaptif, dan proyek akhir praktikum.'
  }
]

export default function LandingPage() {
  usePageTitle('Platform Pembelajaran Interaktif & Sertifikasi Kompetensi')
  const { brand } = useTenant()

  const [activeCodeTab, setActiveCodeTab] = useState<string>('bash')
  const [copiedCode, setCopiedCode] = useState<boolean>(false)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)

  const currentTab = CODE_TABS.find((t) => t.id === activeCodeTab) || CODE_TABS[0]

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentTab.code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const filteredCourses = activeCategory === 'all'
    ? COURSES
    : COURSES.filter((c) => c.tag.toLowerCase().includes(activeCategory.toLowerCase()))

  return (
    <PageTransition className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      {/* ─── PUBLIC STICKY HEADER ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/85 border-b border-border/70 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            {brand?.logoUrl ? (
              <img src={brand.logoUrl} alt="Logo" className="h-9 w-auto object-contain transition-transform group-hover:scale-105" />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                <GraduationCap className="h-5 w-5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight font-display text-foreground leading-none group-hover:text-primary transition-colors">
                {brand?.name || 'LMS Platform'}
              </span>
              <span className="text-[10px] text-primary font-semibold tracking-wider uppercase mt-0.5">
                Enterprise Academy
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Fitur Utama</a>
            <a href="#curriculum" className="hover:text-foreground transition-colors">Kurikulum</a>
            <a href="#code-showcase" className="hover:text-foreground transition-colors">Praktikum Lab</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">Alur Masuk</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          {/* Action Buttons & Theme Switcher */}
          <div className="hidden sm:flex items-center gap-2.5">
            <ThemeToggle />
            <Link to="/verify">
              <Button variant="ghost" size="sm" className="text-xs font-semibold gap-1.5 text-muted-foreground hover:text-foreground">
                <QrCode className="h-3.5 w-3.5" /> Verifikasi Sertifikat
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm" className="text-xs font-semibold">
                Masuk
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 shadow-md shadow-primary/20 hover-lift">
                <Sparkles className="h-3.5 w-3.5" /> Daftar Peserta
              </Button>
            </Link>
          </div>

          {/* Mobile Menu & Theme Toggle Trigger */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-border text-foreground hover:bg-muted"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-border bg-background/95 backdrop-blur-lg px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
            <nav className="flex flex-col gap-2.5 text-sm font-medium text-muted-foreground">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-1.5 px-2 rounded-md hover:bg-muted hover:text-foreground"
              >
                Fitur Utama
              </a>
              <a 
                href="#curriculum" 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-1.5 px-2 rounded-md hover:bg-muted hover:text-foreground"
              >
                Kurikulum
              </a>
              <a 
                href="#code-showcase" 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-1.5 px-2 rounded-md hover:bg-muted hover:text-foreground"
              >
                Praktikum Lab
              </a>
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-1.5 px-2 rounded-md hover:bg-muted hover:text-foreground"
              >
                Alur Masuk
              </a>
              <a 
                href="#faq" 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-1.5 px-2 rounded-md hover:bg-muted hover:text-foreground"
              >
                FAQ
              </a>
              <Link 
                to="/verify" 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-1.5 px-2 rounded-md hover:bg-muted hover:text-foreground flex items-center gap-1.5 text-primary font-semibold"
              >
                <QrCode className="h-4 w-4" /> Cek Verifikasi Sertifikat
              </Link>
            </nav>
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full text-xs font-semibold justify-center">
                  Masuk Portal
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-primary text-primary-foreground font-bold text-xs justify-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Daftar Peserta Baru
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO SECTION ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-28">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-primary/15 dark:bg-primary/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[350px] h-[250px] bg-info/10 dark:bg-indigo-500/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            {/* Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-wide hover-lift cursor-default">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Platform Pembelajaran Cloud, DevOps & Fullstack Modern 2026</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-display tracking-tight text-foreground leading-[1.1]">
              Kuasai Rekayasa Sistem & Cloud dengan <span className="text-primary">Praktikum Interaktif</span>
            </h1>

            {/* Description Subtitle */}
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
              Tingkatkan kompetensi rekayasa sistem, otomatisasi skrip Linux Bash & PowerShell, hingga arsitektur web modern dengan bimbingan modul hands-on, live video streaming, evaluasi checkpoint real-time, dan sertifikasi digital terverifikasi.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm gap-2 shadow-lg shadow-primary/25 hover-lift active-press">
                  Mulai Belajar Sekarang <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#curriculum" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-sm font-semibold hover-lift active-press">
                  Jelajahi Kurikulum Modul
                </Button>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Akses Praktikum Hands-On 24/7
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Sertifikat Terverifikasi QR Publik
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" /> Email Resmi LMS Kustom
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LIVE METRICS TRUST BAR ──────────────────────────────────────── */}
      <section className="py-8 bg-muted/40 border-y border-border/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/70 text-center space-y-1 shadow-sm card-hover">
              <div className="text-3xl sm:text-4xl font-black font-display text-primary">10+</div>
              <div className="text-xs sm:text-sm font-bold text-foreground">Modul Terstandarisasi</div>
              <div className="text-[11px] text-muted-foreground">Kurikulum Industri Terkini</div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/70 text-center space-y-1 shadow-sm card-hover">
              <div className="text-3xl sm:text-4xl font-black font-display text-emerald-500">150+</div>
              <div className="text-xs sm:text-sm font-bold text-foreground">Sesi Praktikum Lab</div>
              <div className="text-[11px] text-muted-foreground">Hands-on Multi-Shell Scripting</div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/70 text-center space-y-1 shadow-sm card-hover">
              <div className="text-3xl sm:text-4xl font-black font-display text-indigo-500">100%</div>
              <div className="text-xs sm:text-sm font-bold text-foreground">Sertifikasi Terverifikasi</div>
              <div className="text-[11px] text-muted-foreground">QR Code Verifikasi Publik</div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/70 text-center space-y-1 shadow-sm card-hover">
              <div className="text-3xl sm:text-4xl font-black font-display text-sky-500">99.9%</div>
              <div className="text-xs sm:text-sm font-bold text-foreground">High Availability</div>
              <div className="text-[11px] text-muted-foreground">Cloud-Native & PWA Offline Sync</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE CODE & TERMINAL LAB SHOWCASE ─────────────────────── */}
      <section id="code-showcase" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 text-xs">
              Simulator Lingkungan Praktikum
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display tracking-tight text-foreground">
              Pengalaman Lab Praktikum Berkelas Nyata
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Ketik, uji, dan validasi kode script langsung di antarmuka LMS dengan panduan checkpoint interaktif dan syntax highlighting multi-bahasa.
            </p>
          </div>

          {/* Mini IDE Terminal Window */}
          <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden border border-border/80 bg-card shadow-2xl transition-all">
            {/* IDE Window Titlebar & Tabs */}
            <div className="bg-muted/80 border-b border-border px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/80" />
                  <div className="h-3 w-3 rounded-full bg-warning/80" />
                  <div className="h-3 w-3 rounded-full bg-success/80" />
                </div>
                <span className="text-xs font-mono text-muted-foreground ml-2 hidden sm:inline">
                  lms-lab-runner — {currentTab.filename}
                </span>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex items-center gap-1 bg-background/60 p-1 rounded-lg border border-border/60">
                {CODE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCodeTab(tab.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      activeCodeTab === tab.id
                        ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Copy Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyCode}
                className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground gap-1"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
              </Button>
            </div>

            {/* Code Content Editor Area */}
            <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm bg-slate-950 text-slate-100 overflow-x-auto custom-scrollbar">
              <pre className="leading-relaxed whitespace-pre font-mono">
                {currentTab.code}
              </pre>
            </div>

            {/* Simulated Terminal Output Drawer */}
            {currentTab.output && (
              <div className="border-t border-slate-800 bg-slate-900/90 px-4 sm:px-6 py-3 font-mono text-xs text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                  <Terminal className="h-3.5 w-3.5" /> Output Eksekusi Terminal
                </div>
                <div className="text-slate-400 whitespace-pre-line text-[11px] sm:text-xs">
                  {currentTab.output}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 6 CORE FEATURE PILLARS ──────────────────────────────────────── */}
      <section id="features" className="py-20 bg-muted/30 border-y border-border/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 text-xs">
              Keunggulan Arsitektur
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display tracking-tight text-foreground">
              Fitur Lengkap Dirancang untuk Keandalan Enterprise
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Menghadirkan ekosistem pembelajaran menyeluruh mulai dari praktikum teknis, otomasi sertifikasi, hingga manajemen multi-institusi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="bg-card border-border/70 card-hover shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center">
                  <Terminal className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg font-display text-foreground">Multi-Shell & Code Runner</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Dukungan syntax highlighter multi-bahasa (Bash Linux, PowerShell, React TSX, Dockerfile, SQL) dengan tombol 1-Click Copy dan validasi kuis adaptif.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-card border-border/70 card-hover shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg font-display text-foreground">Multi-Tenancy & Enterprise SSO</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Isolasi data ketat berbasis tenant ID, dynamic branding kustom, serta integrasi Single Sign-On berbasis SAML 2.0 dan OpenID Connect (OIDC).
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-card border-border/70 card-hover shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                  <Video className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg font-display text-foreground">Adaptive Streaming & SCORM</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Streaming video HTTP 206 dengan resume posisi otomatis, dukungan paket SCORM 1.2/2004, dan xAPI Learning Records Store.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="bg-card border-border/70 card-hover shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg font-display text-foreground">Digital Certificate & QR Verify</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Penerbitan sertifikat digital beresolusi tinggi otomatis pasca-kelulusan dengan nomor seri unik dan verifikasi instan via QR Code.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="bg-card border-border/70 card-hover shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg font-display text-foreground">AI Tutor & Study Rooms</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Bimbingan materi cerdas berbasis AI Tutor, forum tanya jawab per modul, dan ruang belajar kolaboratif realtime via WebSocket.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="bg-card border-border/70 card-hover shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center">
                  <WifiOff className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg font-display text-foreground">Offline PWA & Background Sync</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Akses materi tanpa koneksi internet dengan Progressive Web App dan sinkronisasi otomatis hasil kuis ketika perangkat online kembali.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── CURRICULUM & MODULE CATALOG ─────────────────────────────────── */}
      <section id="curriculum" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 text-xs">
                Katalog Pembelajaran
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display tracking-tight text-foreground">
                Kurikulum Modul Praktikum Terstruktur
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Setiap modul dirancang dari fundamental hingga skenario implementasi produksi di industri.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-muted/60 p-1.5 rounded-xl border border-border/60">
              {[
                { id: 'all', label: 'Semua Kategori' },
                { id: 'cloud', label: 'Cloud & DevOps' },
                { id: 'fullstack', label: 'Fullstack Web' },
                { id: 'linux', label: 'Linux & Security' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeCategory === cat.id
                      ? 'bg-card text-foreground font-bold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="bg-card border-border/80 card-hover flex flex-col justify-between overflow-hidden shadow-sm">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="font-semibold text-xs text-primary">
                      {course.tag}
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-amber-500" /> {course.level}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold font-display text-foreground hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {course.desc}
                    </p>
                  </div>

                  {/* Topics Checkmark */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="text-xs font-bold text-foreground">Topik Bahasan Utama:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-muted-foreground">
                      {course.topics.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <div className="px-6 py-4 bg-muted/40 border-t border-border flex items-center justify-between gap-4">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">{course.sessions} Sesi</span> • {course.duration}
                  </div>
                  <Link to="/register">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1 hover-lift">
                      Mulai Modul <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4-STEP REGISTRATION TO CERTIFICATE WORKFLOW ─────────────────── */}
      <section id="how-it-works" className="py-20 bg-muted/30 border-y border-border/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 text-xs">
              Alur Perjalanan Peserta
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display tracking-tight text-foreground">
              4 Langkah Mudah Meraih Sertifikasi Digital
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Proses registrasi dan validasi yang dirancang mulus, aman, dan berstandar industri.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 card-hover shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary font-black text-sm flex items-center justify-center font-display">
                1
              </div>
              <h4 className="font-bold text-base font-display text-foreground">Pendaftaran Mandiri</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Daftar dengan form pendaftaran mandiri atau gunakan akun Google Anda di portal registrasi peserta LMS.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 card-hover shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/15 text-indigo-500 font-black text-sm flex items-center justify-center font-display">
                2
              </div>
              <h4 className="font-bold text-base font-display text-foreground">Generate Email LMS</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sistem otomatis membuatkan ID Email Resmi LMS (*contoh: nama@student.lms.alfanet.id*) yang unik untuk profil Anda.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 card-hover shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-amber-500/15 text-amber-500 font-black text-sm flex items-center justify-center font-display">
                3
              </div>
              <h4 className="font-bold text-base font-display text-foreground">Verifikasi Administrator</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Administrator meninjau dan menyetujui akun pendaftaran Anda untuk menjamin keamanan & integritas platform.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/70 space-y-3 card-hover shadow-sm">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-500 font-black text-sm flex items-center justify-center font-display">
                4
              </div>
              <h4 className="font-bold text-base font-display text-foreground">Praktikum & Sertifikat</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Selesaikan materi, praktikum checkpoint, raih passing grade kuis, dan download sertifikat resmi ber-QR Code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE FAQ ACCORDION ───────────────────────────────────── */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 text-xs">
              Pusat Informasi & FAQ
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display tracking-tight text-foreground">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-muted-foreground text-sm">
              Jawaban cepat untuk pertanyaan umum seputar sistem LMS, ujian kuis, dan sertifikasi.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border/80 bg-card overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3 animate-in fade-in-50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── HIGH-CONVERTING BOTTOM CTA ──────────────────────────────────── */}
      <section className="py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-3xl bg-gradient-to-tr from-primary/15 via-indigo-500/10 to-primary/5 border border-primary/25 p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
            <div className="space-y-2 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-black font-display text-foreground tracking-tight">
                Siap Mengembangkan Kompetensi Digital Anda?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Bergabunglah bersama ratusan engineer dan pembelajar lainnya dalam ekosistem LMS Academy terstandarisasi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm gap-2 shadow-xl shadow-primary/30 hover-lift active-press">
                  Daftar Akun Peserta <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/verify" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-sm font-semibold hover-lift active-press">
                  <QrCode className="h-4 w-4 mr-2" /> Verifikasi Sertifikat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DYNAMIC FOOTER ──────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-border bg-card/60 py-12 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Brand */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                {brand?.logoUrl ? (
                  <img src={brand.logoUrl} alt="Logo" className="h-7 w-auto object-contain" />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                )}
                <span className="font-extrabold text-base font-display text-foreground">
                  {brand?.name || 'LMS Platform Enterprise Academy'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Platform pembelajaran interaktif berbasis cloud, shell command automation, dan sertifikasi digital terverifikasi publik untuk universitas, sekolah kejuruan, dan korporasi.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-500 font-semibold">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Semua Layanan Sistem Beroperasi Normal (99.9% Uptime)</span>
              </div>
            </div>

            {/* Column 2: Nav Links */}
            <div className="space-y-3">
              <div className="font-bold text-foreground text-xs uppercase tracking-wider">Navigasi Utama</div>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-foreground transition-colors">Fitur Unggulan</a></li>
                <li><a href="#curriculum" className="hover:text-foreground transition-colors">Katalog Kurikulum</a></li>
                <li><a href="#code-showcase" className="hover:text-foreground transition-colors">Simulator Lab</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">Pusat Bantuan / FAQ</a></li>
              </ul>
            </div>

            {/* Column 3: Portal Links */}
            <div className="space-y-3">
              <div className="font-bold text-foreground text-xs uppercase tracking-wider">Akses Portal</div>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-foreground transition-colors">Masuk ke Portal</Link></li>
                <li><Link to="/register" className="hover:text-foreground transition-colors">Pendaftaran Peserta Baru</Link></li>
                <li><Link to="/verify" className="hover:text-foreground transition-colors">Verifikasi Sertifikat QR</Link></li>
                <li><Link to="/forgot-password" className="hover:text-foreground transition-colors">Lupa Password Akun</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© {new Date().getFullYear()} {brand?.name || 'LMS Platform'}. Hak Cipta Dilindungi Undang-Undang.</p>
            <div className="flex items-center gap-4">
              <span>Keamanan Standar OWASP & SSL</span>
              <span>•</span>
              <span>Multi-Tenant Architecture</span>
            </div>
          </div>
        </div>
      </footer>
    </PageTransition>
  )
}
