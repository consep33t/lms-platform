import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, BookOpen, Compass, Sparkles } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function NotFoundPage() {
  usePageTitle('404 — Halaman Tidak Ditemukan')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent/20 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10 space-y-8 p-8 sm:p-10 rounded-3xl border border-border bg-card/90 backdrop-blur-xl shadow-2xl animate-scale-in">
        {/* Floating 404 Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="text-7xl sm:text-8xl font-black font-display tracking-wider bg-gradient-to-br from-primary via-primary/80 to-accent-foreground bg-clip-text text-transparent animate-float select-none">
            404
          </div>
          <div className="absolute -top-2 -right-3 p-2 bg-primary/10 border border-primary/20 rounded-full text-primary animate-pulse">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            Halaman yang Anda tuju mungkin telah dipindahkan, dihapus, atau tautan yang Anda masukkan salah.
          </p>
        </div>

        {/* Quick Action Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full gap-2 rounded-xl h-11 border-border/80 hover:bg-muted/80 active-press"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Sebelumnya
          </Button>
          <Link to="/" className="w-full">
            <Button
              type="button"
              className="w-full gap-2 rounded-xl h-11 shadow-sm active-press"
            >
              <Home className="h-4 w-4" /> Menuju Beranda
            </Button>
          </Link>
        </div>

        {/* Quick Links Footer */}
        <div className="pt-4 border-t border-border/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Pintasan Menu
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <Link
              to="/history"
              className="px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="h-3.5 w-3.5 text-primary" /> Riwayat Belajar
            </Link>
            <Link
              to="/leaderboard"
              className="px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Compass className="h-3.5 w-3.5 text-primary" /> Peringkat Nilai
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
