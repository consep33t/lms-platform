import React from 'react'
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
  BookOpen
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-primary selection:text-white">
      {/* PUBLIC NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white leading-none">
                LMS Platform
              </span>
              <span className="text-[10px] text-primary font-semibold tracking-wider uppercase mt-0.5">
                Enterprise Academy
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Fitur Unggulan</a>
            <a href="#curriculum" className="hover:text-white transition-colors">Kurikulum Modul</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Alur Pendaftaran</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-slate-200 hover:text-white hover:bg-slate-800 text-xs font-semibold">
                Masuk
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold text-xs gap-1.5 shadow-lg shadow-primary/25">
                <Sparkles className="h-3.5 w-3.5" /> Daftar Peserta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
        {/* Glow gradients background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/20 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[400px] h-[300px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <Badge variant="outline" className="px-3.5 py-1 rounded-full border-primary/40 text-primary bg-primary/10 text-xs font-semibold tracking-wide">
              ⚡ Platform Pembelajaran Hands-On Praktikum & Sertifikasi 2026
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
              Kuasai Cloud, Shell, & DevOps dengan Praktikum Interaktif
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Tingkatkan kompetensi rekayasa sistem, otomatisasi skrip Linux Bash & PowerShell, hingga arsitektur web modern dengan bimbingan modul terstandarisasi industri.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-primary hover:bg-primary/90 text-white font-bold text-sm gap-2 shadow-xl shadow-primary/30">
                  Daftar Peserta Baru <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-sm font-semibold">
                  Masuk ke Portal LMS
                </Button>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t border-slate-800/80">
              <div className="p-3">
                <div className="text-2xl font-extrabold text-white">10+</div>
                <div className="text-xs text-slate-400">Modul Industri</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-extrabold text-primary">150+</div>
                <div className="text-xs text-slate-400">Sesi Praktikum</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-extrabold text-emerald-400">100%</div>
                <div className="text-xs text-slate-400">Evaluasi Checkpoint</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-extrabold text-indigo-400">206</div>
                <div className="text-xs text-slate-400">HTTP Stream Video</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Fitur Dirancang Khusus untuk Engineer
            </h2>
            <p className="text-slate-400 text-sm">
              Pengalaman belajar yang menggabungkan teori berbobot, diagram arsitektur mendalam, dan baris perintah siap uji.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="bg-slate-900/80 border-slate-800 text-slate-100 hover:border-primary/50 transition-colors shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                  <Terminal className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-white">Multi-Shell & Code Runner</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dukungan syntax highlighter multi-bahasa: Bash Linux, PowerShell, Windows CMD, React TSX, HTML5, Dockerfile, dan YAML dengan tombol 1-Click Copy.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-slate-900/80 border-slate-800 text-slate-100 hover:border-primary/50 transition-colors shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-white">Email Resmi & Verifikasi Admin</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Setiap pendaftar otomatis mendapatkan Email Resmi LMS kustom (*e.g. name@student.lms.alfanet.id*) dengan verifikasi ketat dari administrator.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-slate-900/80 border-slate-800 text-slate-100 hover:border-primary/50 transition-colors shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Video className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-white">Video HTTP 206 Streaming</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Streaming video demonstrasi praktikum berkecepatan tinggi dengan tracking progres durasi tonton dan pemulihan posisi otomatis.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / REGISTRATION FLOW */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 text-xs">
              Alur Masuk Peserta
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              4 Langkah Mudah Memulai Belajar
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-base text-white">Daftar Akun</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Isi form pendaftaran mandiri atau gunakan akun Google Anda di portal registrasi peserta.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-base text-white">Generate Email LMS</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sistem otomatis men-generate ID Email Resmi LMS (@student.lms.alfanet.id) yang unik untuk Anda.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="h-8 w-8 rounded-full bg-amber-500/20 text-amber-400 font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-base text-white">Verifikasi Admin</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Administrator meninjau dan menyetujui akun pendaftaran Anda untuk menjamin keamanan platform.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm flex items-center justify-center">
                4
              </div>
              <h4 className="font-bold text-base text-white">Mulai Praktikum</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Login dengan email LMS atau email pribadi Anda dan selesaikan modul untuk meraih sertifikat.
              </p>
            </div>
          </div>

          <div className="text-center pt-6">
            <Link to="/register">
              <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-bold text-sm gap-2 shadow-xl shadow-primary/30">
                Mulai Pendaftaran Sekarang <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="font-semibold text-slate-400">© 2026 LMS Platform. Hak Cipta Dilindungi.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-slate-300">Portal Login</Link>
            <Link to="/register" className="hover:text-slate-300">Pendaftaran Peserta</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
