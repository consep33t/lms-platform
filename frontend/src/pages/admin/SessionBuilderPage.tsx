import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Plus,
  Terminal,
  Code2,
  Sparkles,
  Video,
  HelpCircle,
  FileText,
  Trash2,
  CheckCircle2,
  Upload,
  Eye,
  RefreshCw,
  Layers,
  Globe,
  Atom,
  FileCode2,
  FileSpreadsheet,
  Download,
  UploadCloud,
  X
} from 'lucide-react'
import { RichContentRenderer } from '@/components/common/RichContentRenderer'
import api from '@/lib/api'


interface SlideItem {
  id: number
  step_number: number
  step_type: string
  title: string
  text_body?: string
  media_file_id?: number
}

export default function SessionBuilderPage() {
  const { moduleId, sessionId } = useParams<{ moduleId: string; sessionId: string }>()
  const navigate = useNavigate()

  const [sessionDetail, setSessionDetail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'video' | 'quiz'>('text')

  // Text Slide States
  const [textBody, setTextBody] = useState(`## 1. Panduan Praktikum Command Line & Web Development
Jalankan perintah berikut di terminal:

\`\`\`bash title="Investigasi Port Jaringan" desc="Memeriksa socket listening dan container aktif"
ss -tulpn | grep :8088
docker ps -a
\`\`\`

\`\`\`html title="Struktur Header Semantic HTML5" desc="Contoh layout modern dengan tag semantic"
<header class="navbar-container">
  <div class="brand-logo">LMS Enterprise</div>
  <nav class="nav-links">
    <a href="/courses">Katalog Kursus</a>
  </nav>
</header>
\`\`\`

\`\`\`tsx title="Komponen React TypeScript" desc="Hook useState interaktif untuk state counter"
import React, { useState } from 'react'

export function LiveCounter() {
  const [count, setCount] = useState(0)
  return (
    <button onClick={() => setCount(c => c + 1)} className="btn-primary">
      Klik ({count})
    </button>
  )
}
\`\`\``)
  const [savingText, setSavingText] = useState(false)

  // Media Upload States
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadingMedia, setUploadingMedia] = useState(false)

  // Quiz States
  const [quizQuestion, setQuizQuestion] = useState('')
  const [questionType, setQuestionType] = useState('multiple_choice')
  const [opt1, setOpt1] = useState('')
  const [opt2, setOpt2] = useState('')
  const [opt3, setOpt3] = useState('')
  const [opt4, setOpt4] = useState('')
  const [correctOpts, setCorrectOpts] = useState<number[]>([1])
  const [metaData, setMetaData] = useState('{}')
  const [savingQuiz, setSavingQuiz] = useState(false)

  // Custom Code Modal States
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customLang, setCustomLang] = useState('html')
  const [customTitle, setCustomTitle] = useState('')
  const [customDesc, setCustomDesc] = useState('')
  const [customCode, setCustomCode] = useState('')

  // CSV Import States
  const [showCsvModal, setShowCsvModal] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importingCsv, setImportingCsv] = useState(false)

  const handleDownloadCsvTemplate = () => {
    const csvContent =
      'question_text,points,option_a,option_b,option_c,option_d,correct_option,explanation\n' +
      '"Perintah apa yang digunakan untuk memeriksa container Docker aktif?",10,"docker ps","docker run","docker logs","docker stop","A","docker ps menampilkan daftar container aktif."\n' +
      '"Berapakah nomor port standar untuk protokol HTTPS?",10,"80","443","22","8080","B","HTTPS berjalan pada port 443 secara default."\n' +
      '"Manakah metode HTTP yang bersifat idempotent?",10,"POST","PATCH","GET","Semua Salah","C","GET aman dan idempotent."\n'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `template_soal_kuis_sesi_${sessionId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!csvFile || !sessionId) return

    const formData = new FormData()
    formData.append('file', csvFile)

    try {
      setImportingCsv(true)
      const res = await api.post(`/admin/questions/session/${sessionId}/import-csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert(res.data.message || 'Berhasil mengimpor soal kuis!')
      setShowCsvModal(false)
      setCsvFile(null)
      fetchSessionFlow()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal mengimpor file CSV.')
    } finally {
      setImportingCsv(false)
    }
  }

  useEffect(() => {
    fetchSessionFlow()
  }, [sessionId])


  const fetchSessionFlow = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/sessions/${sessionId}`)
      setSessionDetail(res.data)
    } catch (err) {
      console.error('Failed to fetch session flow', err)
    } finally {
      setLoading(false)
    }
  }

  // Quick Snippet Toolbar Actions
  const insertSnippet = (snippet: string) => {
    setTextBody((prev) => (prev ? `${prev}\n\n${snippet}` : snippet))
  }

  const insertBash = () => {
    insertSnippet(`## Perintah Terminal Linux / Bash
Jalankan perintah berikut di terminal:

\`\`\`bash title="Pemeriksaan Port & Container" desc="Perintah monitoring status kernel dan socket jaringan"
ss -tulpn | grep -E ':80|:443|:8088'
curl -I https://lms.consep33t.my.id
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
\`\`\``)
  }

  const insertPowerShell = () => {
    insertSnippet(`## Perintah Windows PowerShell
Jalankan cmdlet PowerShell berikut:

\`\`\`powershell title="Otomasi Jaringan PowerShell" desc="Cmdlet pengujian port TCP dan manipulasi service"
Test-NetConnection -ComputerName 192.168.10.100 -Port 8088
Get-Service -Name "docker" | Select-Object Status, StartType
Invoke-RestMethod -Uri "https://lms.consep33t.my.id/api/v1/health"
\`\`\``)
  }

  const insertCmd = () => {
    insertSnippet(`## Perintah Windows Command Prompt (CMD)
Jalankan di jendela CMD:

\`\`\`cmd title="Command Prompt Klasik" desc="Perintah diagnosis network Windows"
netstat -ano | findstr :8088
ping -n 4 192.168.10.100
systeminfo | findstr /B /C:"OS Name"
\`\`\``)
  }

  const insertHtml = () => {
    insertSnippet(`## Struktur Dokumen Semantic HTML5
Berikut adalah implementasi layout semantic modern:

\`\`\`html title="Semantic HTML5 Structure" desc="Layout header, main content, dan footer dengan semantic tags"
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>LMS Enterprise Platform</title>
</head>
<body>
  <header class="main-header">
    <h1>Akademi Teknologi & Cloud Architecture</h1>
  </header>
  <main class="content-container">
    <p>Selamat datang di sesi pembelajaran interaktif.</p>
  </main>
</body>
</html>
\`\`\``)
  }

  const insertReact = () => {
    insertSnippet(`## Komponen React & Hooks Interaktif
Contoh implementasi functional component dengan TypeScript & Hooks:

\`\`\`tsx title="React TSX Component" desc="Komponen pemroses data dengan state management dan event handling"
import React, { useState, useEffect } from 'react'

interface UserCardProps {
  name: string
  role: string
}

export function UserProfileCard({ name, role }: UserCardProps) {
  const [active, setActive] = useState(true)

  return (
    <div className="p-4 rounded-xl border bg-card shadow-sm">
      <h3 className="font-bold text-lg">{name}</h3>
      <p className="text-sm text-muted-foreground">{role}</p>
      <button 
        onClick={() => setActive(!active)}
        className="mt-3 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold"
      >
        Status: {active ? 'Aktif' : 'Nonaktif'}
      </button>
    </div>
  )
}
\`\`\``)
  }

  const insertPython = () => {
    insertSnippet(`## Implementasi Kode Asynchronous Python
Berikut adalah fungsi pemrosesan REST API:

\`\`\`python title="FastAPI Asynchronous Gateway" desc="Endpoint pemrosesan data dengan Pydantic validasi"
import asyncio
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="LMS Core")

class HealthStatus(BaseModel):
    status: str
    uptime_seconds: float

@app.get("/api/v1/health", response_model=HealthStatus)
async def check_health():
    return HealthStatus(status="healthy", uptime_seconds=86400.0)
\`\`\``)
  }

  const insertYaml = () => {
    insertSnippet(`## Konfigurasi Kubernetes Manifest YAML
Definisi spesifikasi deployment container:

\`\`\`yaml title="Kubernetes Deployment Manifest" desc="Konfigurasi 3 replika container dengan resource limits"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lms-core-deployment
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: backend
        image: lms_backend_prod:latest
        resources:
          limits:
            memory: "1Gi"
            cpu: "1000m"
\`\`\``)
  }

  const insertCustomBlockToEditor = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customCode.trim()) return

    const lang = customLang.trim() || 'text'
    let headerMeta = lang
    if (customTitle.trim()) headerMeta += ` title="${customTitle.trim()}"`
    if (customDesc.trim()) headerMeta += ` desc="${customDesc.trim()}"`

    const formattedBlock = `\`\`\`${headerMeta}\n${customCode.trim()}\n\`\`\``
    insertSnippet(formattedBlock)

    // Reset Form
    setCustomTitle('')
    setCustomDesc('')
    setCustomCode('')
    setShowCustomModal(false)
  }

  // Save Text Slide
  const handleSaveTextSlide = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!textBody.trim()) return

    const nextOrder = (sessionDetail?.steps?.length || 0) + 1
    try {
      setSavingText(true)
      await api.post(`/admin/modules/sessions/${sessionId}/contents`, {
        content_type: 'text',
        text_body: textBody,
        order: nextOrder
      })
      alert('Slide teks & kode berhasil ditambahkan!')
      fetchSessionFlow()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal menyimpan slide teks.')
    } finally {
      setSavingText(false)
    }
  }

  // Upload & Save Image Slide
  const handleUploadImageSlide = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) {
      alert('Pilih file gambar diagram terlebih dahulu!')
      return
    }

    try {
      setUploadingMedia(true)
      const formData = new FormData()
      formData.append('file', imageFile)
      formData.append('owner_type', 'session_content')
      formData.append('owner_id', sessionId!)

      const uploadRes = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const mediaId = uploadRes.data.id

      const nextOrder = (sessionDetail?.steps?.length || 0) + 1
      await api.post(`/admin/modules/sessions/${sessionId}/contents`, {
        content_type: 'image',
        media_file_id: mediaId,
        order: nextOrder
      })
      alert('Slide gambar diagram berhasil diunggah & disimpan!')
      setImageFile(null)
      fetchSessionFlow()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal mengunggah gambar.')
    } finally {
      setUploadingMedia(false)
    }
  }

  // Upload & Save Video Slide
  const handleUploadVideoSlide = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoFile) {
      alert('Pilih file video MP4 terlebih dahulu!')
      return
    }

    try {
      setUploadingMedia(true)
      const formData = new FormData()
      formData.append('file', videoFile)
      formData.append('owner_type', 'session_content')
      formData.append('owner_id', sessionId!)

      const uploadRes = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const mediaId = uploadRes.data.id

      const nextOrder = (sessionDetail?.steps?.length || 0) + 1
      await api.post(`/admin/modules/sessions/${sessionId}/contents`, {
        content_type: 'video',
        media_file_id: mediaId,
        order: nextOrder
      })
      alert('Slide video demonstrasi berhasil diunggah & disimpan!')
      setVideoFile(null)
      fetchSessionFlow()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal mengunggah video.')
    } finally {
      setUploadingMedia(false)
    }
  }

  // Save Quiz Checkpoint
  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quizQuestion.trim()) return

    let options: any[] = []
    if (questionType === 'multiple_choice' || questionType === 'multi_select') {
      if (!opt1.trim() || !opt2.trim()) {
        alert('Minimal 2 pilihan wajib diisi')
        return
      }
      options = [
        { option_text: opt1, is_correct: correctOpts.includes(1), order: 1 },
        { option_text: opt2, is_correct: correctOpts.includes(2), order: 2 },
      ]
      if (opt3.trim()) options.push({ option_text: opt3, is_correct: correctOpts.includes(3), order: 3 })
      if (opt4.trim()) options.push({ option_text: opt4, is_correct: correctOpts.includes(4), order: 4 })
    }

    let parsedMeta = {}
    try {
      if (metaData.trim()) {
        parsedMeta = JSON.parse(metaData)
      }
    } catch (err) {
      alert('Format meta_data JSON tidak valid.')
      return
    }

    const nextOrder = (sessionDetail?.steps?.length || 0) + 1
    try {
      setSavingQuiz(true)
      await api.post(`/admin/modules/sessions/${sessionId}/questions`, {
        session_id: parseInt(sessionId!),
        question_text: quizQuestion,
        question_type: questionType,
        points: 1,
        order: nextOrder,
        is_reusable: false,
        options: options,
        meta_data: parsedMeta
      })
      alert('Soal kuis checkpoint berhasil ditambahkan ke sesi!')
      setQuizQuestion('')
      setOpt1('')
      setOpt2('')
      setOpt3('')
      setOpt4('')
      setCorrectOpts([1])
      setMetaData('{}')
      fetchSessionFlow()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal menyimpan kuis.')
    } finally {
      setSavingQuiz(false)
    }
  }

  // Delete Slide Content
  const handleDeleteContent = async (contentId: number) => {
    if (!confirm('Hapus slide ini dari sesi?')) return
    try {
      await api.delete(`/admin/modules/contents/${contentId}`)
      fetchSessionFlow()
    } catch (err) {
      alert('Gagal menghapus slide.')
    }
  }

  // Delete Question
  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Hapus soal kuis ini?')) return
    try {
      await api.delete(`/admin/modules/questions/${questionId}`)
      fetchSessionFlow()
    } catch (err) {
      alert('Gagal menghapus soal kuis.')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div className="space-y-1">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/modules')} className="gap-1 text-xs text-muted-foreground p-0 hover:bg-transparent">
                <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Modul
              </Button>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                <Layers className="h-7 w-7 text-primary" /> Session Content Builder
              </h1>
              <p className="text-sm text-muted-foreground">
                Sesi ID #{sessionId}: <strong>{sessionDetail?.title || 'Memuat...'}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchSessionFlow} className="gap-1.5 shadow-sm">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh Konten
              </Button>
            </div>
          </div>

          {/* Grid Layout: Kiri Form Builder, Kanan Daftar Slide Terdaftar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* KOLOM KIRI: TABS BUILDER (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-border/80 shadow-md overflow-hidden">
                {/* Tab Navigation */}
                <div className="flex flex-wrap border-b bg-muted/30 p-2 gap-2">
                  <Button
                    variant={activeTab === 'text' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('text')}
                    className="gap-1.5 text-xs font-semibold"
                  >
                    <Code2 className="h-4 w-4" /> Slide Teks, Code & CLI
                  </Button>
                  <Button
                    variant={activeTab === 'image' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('image')}
                    className={`gap-1.5 text-xs font-semibold ${activeTab === 'image' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                  >
                    <Sparkles className="h-4 w-4" /> Upload Gambar Diagram
                  </Button>
                  <Button
                    variant={activeTab === 'video' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('video')}
                    className={`gap-1.5 text-xs font-semibold ${activeTab === 'video' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  >
                    <Video className="h-4 w-4" /> Upload Video MP4
                  </Button>
                  <Button
                    variant={activeTab === 'quiz' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('quiz')}
                    className={`gap-1.5 text-xs font-semibold ${activeTab === 'quiz' ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                  >
                    <HelpCircle className="h-4 w-4" /> Tambah Checkpoint Kuis
                  </Button>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* 1. BUILDER SLIDE TEKS & CODE/CLI */}
                  {activeTab === 'text' && (
                    <form onSubmit={handleSaveTextSlide} className="space-y-4">
                      {/* Quick Insert Snippet Toolbar */}
                      <div className="p-4 rounded-xl border bg-slate-900/50 border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            ⚡ <strong>Quick Snippet Toolbar</strong> (Klik untuk menyisipkan):
                          </div>
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => setShowCustomModal(true)}
                            className="h-7 text-xs gap-1 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white font-semibold shadow"
                          >
                            <Sparkles className="h-3 w-3" /> + Custom Code & Shell Builder
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button type="button" variant="outline" size="sm" onClick={insertBash} className="gap-1 text-xs border-sky-500/50 text-sky-400 bg-sky-950/40 hover:bg-sky-900/60">
                            <Terminal className="h-3.5 w-3.5" /> + Bash
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={insertPowerShell} className="gap-1 text-xs border-blue-500/50 text-blue-400 bg-blue-950/40 hover:bg-blue-900/60">
                            <Terminal className="h-3.5 w-3.5" /> + PowerShell
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={insertCmd} className="gap-1 text-xs border-amber-500/50 text-amber-400 bg-amber-950/40 hover:bg-amber-900/60">
                            <Terminal className="h-3.5 w-3.5" /> + CMD
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={insertHtml} className="gap-1 text-xs border-orange-500/50 text-orange-400 bg-orange-950/40 hover:bg-orange-900/60">
                            <Globe className="h-3.5 w-3.5" /> + HTML5
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={insertReact} className="gap-1 text-xs border-cyan-500/50 text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/60">
                            <Atom className="h-3.5 w-3.5" /> + React (JSX/TSX)
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={insertPython} className="gap-1 text-xs border-emerald-500/50 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60">
                            <Code2 className="h-3.5 w-3.5" /> + Python
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={insertYaml} className="gap-1 text-xs border-purple-500/50 text-purple-400 bg-purple-950/40 hover:bg-purple-900/60">
                            <Code2 className="h-3.5 w-3.5" /> + YAML Config
                          </Button>
                        </div>
                      </div>

                      {/* Text Editor & Live Preview */}
                      <div className="space-y-2">
                        <Label htmlFor="tEditor" className="text-sm font-semibold">Teks Materi Markdown</Label>
                        <textarea
                          id="tEditor"
                          rows={12}
                          className="w-full p-4 rounded-xl border bg-slate-950 text-slate-100 font-mono text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:outline-none leading-relaxed"
                          value={textBody}
                          onChange={(e) => setTextBody(e.target.value)}
                          required
                        />
                      </div>

                      {/* Live Render Preview Box */}
                      <div className="space-y-2 border-t pt-4">
                        <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                          <Eye className="h-4 w-4 text-primary" /> Live Preview Tampilan Peserta:
                        </div>
                        <div className="p-4 rounded-xl border bg-muted/10">
                          <RichContentRenderer content={textBody} />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={savingText} className="gap-1.5 shadow-md">
                          <Plus className="h-4 w-4" /> {savingText ? 'Menyimpan...' : 'Tambahkan Slide Teks & Code'}
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* 2. BUILDER UPLOAD GAMBAR */}
                  {activeTab === 'image' && (
                    <form onSubmit={handleUploadImageSlide} className="space-y-4">
                      <div className="p-6 rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 text-center space-y-3">
                        <Sparkles className="h-10 w-10 text-emerald-500 mx-auto" />
                        <div>
                          <h4 className="font-bold text-base text-foreground">Upload Gambar / Diagram Arsitektur</h4>
                          <p className="text-xs text-muted-foreground">Format yang didukung: PNG, JPG, SVG, WebP (Maks 10MB)</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                          className="block mx-auto text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                          required
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" disabled={uploadingMedia || !imageFile} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                          <Upload className="h-4 w-4" /> {uploadingMedia ? 'Mengunggah...' : 'Unggah & Buat Slide Gambar'}
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* 3. BUILDER UPLOAD VIDEO */}
                  {activeTab === 'video' && (
                    <form onSubmit={handleUploadVideoSlide} className="space-y-4">
                      <div className="p-6 rounded-2xl border-2 border-dashed border-blue-500/40 bg-blue-500/5 text-center space-y-3">
                        <Video className="h-10 w-10 text-blue-500 mx-auto" />
                        <div>
                          <h4 className="font-bold text-base text-foreground">Upload Video Demonstrasi Praktikum</h4>
                          <p className="text-xs text-muted-foreground">Format yang didukung: MP4, WebM (Mendukung Streaming HTTP 206)</p>
                        </div>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                          className="block mx-auto text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                          required
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" disabled={uploadingMedia || !videoFile} className="gap-1.5 bg-blue-600 hover:bg-blue-700">
                          <Upload className="h-4 w-4" /> {uploadingMedia ? 'Mengunggah Video...' : 'Unggah & Buat Slide Video'}
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* 4. BUILDER KUIS CHECKPOINT */}
                  {activeTab === 'quiz' && (
                    <form onSubmit={handleSaveQuiz} className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10">
                        <div className="text-xs">
                          <span className="font-bold text-amber-900 dark:text-amber-200">Import Soal Massal:</span>
                          <span className="text-muted-foreground ml-1">Unggah berkas spreadsheet CSV untuk menambahkan banyak soal sekaligus.</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCsvModal(true)}
                          className="h-8 gap-1.5 text-xs font-bold border-amber-500/50 bg-card hover:bg-amber-500/15"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5 text-amber-600" /> Import Soal (.CSV)
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="qType" className="text-sm font-semibold">Tipe Pertanyaan</Label>
                          <select
                            id="qType"
                            className="w-full p-2 rounded-lg border bg-background text-sm"
                            value={questionType}
                            onChange={(e) => setQuestionType(e.target.value)}
                          >
                            <option value="multiple_choice">Pilihan Ganda</option>
                            <option value="multi_select">Multi-Select</option>
                            <option value="essay">Essay</option>
                            <option value="code">Code Snippet</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="qTitle" className="text-sm font-semibold">Pertanyaan Evaluasi Checkpoint</Label>
                        <textarea
                          id="qTitle"
                          placeholder="Misal: Perintah apa yang digunakan untuk memeriksa status container Docker?"
                          className="w-full p-3 rounded-lg border bg-background text-sm min-h-[80px]"
                          value={quizQuestion}
                          onChange={(e) => setQuizQuestion(e.target.value)}
                          required
                        />
                      </div>

                      {(questionType === 'multiple_choice' || questionType === 'multi_select') && (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Pilihan Jawaban (Pilih checkbox/radio untuk menentukan kunci jawaban yang benar):</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map((num) => {
                              const val = num === 1 ? opt1 : num === 2 ? opt2 : num === 3 ? opt3 : opt4;
                              const setVal = num === 1 ? setOpt1 : num === 2 ? setOpt2 : num === 3 ? setOpt3 : setOpt4;
                              return (
                                <div key={num} className="flex items-center gap-2 p-2.5 border rounded-xl bg-muted/20">
                                  <input
                                    type={questionType === 'multiple_choice' ? 'radio' : 'checkbox'}
                                    name={questionType === 'multiple_choice' ? 'cOpt' : `cOpt${num}`}
                                    checked={correctOpts.includes(num)}
                                    onChange={(e) => {
                                      if (questionType === 'multiple_choice') {
                                        setCorrectOpts([num])
                                      } else {
                                        setCorrectOpts(prev => 
                                          e.target.checked ? [...prev, num] : prev.filter(x => x !== num)
                                        )
                                      }
                                    }}
                                  />
                                  <Input placeholder={`Pilihan ${String.fromCharCode(64 + num)}${num > 2 ? ' (Opsional)' : ''}`} value={val} onChange={(e) => setVal(e.target.value)} required={num <= 2} />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1">
                        <Label htmlFor="qMeta" className="text-sm font-semibold">Metadata JSON (Opsional, untuk kustomisasi Code/Essay)</Label>
                        <textarea
                          id="qMeta"
                          placeholder='{"language": "python", "template": "def solve():\n  pass"}'
                          className="w-full p-3 rounded-lg border bg-slate-950 text-slate-100 font-mono text-xs min-h-[80px]"
                          value={metaData}
                          onChange={(e) => setMetaData(e.target.value)}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" disabled={savingQuiz} className="gap-1.5 bg-amber-600 hover:bg-amber-700">
                          <Plus className="h-4 w-4" /> {savingQuiz ? 'Menyimpan...' : 'Tambahkan Kuis Checkpoint'}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* KOLOM KANAN: DAFTAR SLIDE & KUIS TERDAFTAR (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="border-border/80 shadow-md">
                <CardHeader className="bg-muted/30 border-b p-4">
                  <CardTitle className="text-base font-bold flex items-center justify-between">
                    <span>Urutan Slide ({sessionDetail?.steps?.length || 0})</span>
                    <Badge variant="outline" className="text-xs">{sessionDetail?.duration_minutes || 0} Menit</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">Memuat urutan slide...</div>
                  ) : !sessionDetail?.steps || sessionDetail.steps.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">Belum ada slide atau kuis di sesi ini.</div>
                  ) : (
                    <div className="divide-y max-h-[700px] overflow-y-auto">
                      {sessionDetail.steps.map((s: any) => (
                        <div key={s.id} className="p-3.5 flex items-start justify-between gap-3 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start gap-2.5">
                            <span className="h-6 w-6 rounded-md bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              #{s.step_number}
                            </span>
                            <div>
                              <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                                {s.step_type === 'text' && <FileText className="h-3.5 w-3.5 text-primary" />}
                                {s.step_type === 'image' && <Sparkles className="h-3.5 w-3.5 text-emerald-500" />}
                                {s.step_type === 'video' && <Video className="h-3.5 w-3.5 text-blue-500" />}
                                {s.step_type === 'quiz' && <HelpCircle className="h-3.5 w-3.5 text-amber-500" />}
                                <span className="line-clamp-1">{s.title}</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground uppercase font-mono mt-0.5">
                                Tipe: {s.step_type} {s.quiz_weight_percent ? `• Bobot: ${s.quiz_weight_percent}%` : ''}
                              </p>
                            </div>
                          </div>
                          <div>
                            {s.step_type !== 'quiz' ? (
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteContent(s.id)} className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteQuestion(s.id - 10000)} className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* MODAL DIALOG CUSTOM CODE & SHELL BUILDER */}
          {showCustomModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <Card className="w-full max-w-lg border-primary/50 shadow-2xl bg-card">
                <CardHeader className="bg-muted/40 border-b flex flex-row items-center justify-between p-4 sm:p-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <FileCode2 className="h-5 w-5 text-primary" /> Sisipkan Custom Code / Terminal Block
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowCustomModal(false)} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <form onSubmit={insertCustomBlockToEditor}>
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="cLang">Bahasa Pemrograman / Shell</Label>
                      <Input
                        id="cLang"
                        placeholder="Misal: html, react, tsx, rust, go, csharp, bash, powershell, custom"
                        value={customLang}
                        onChange={(e) => setCustomLang(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="cTitle">Judul Kustom (Custom Title)</Label>
                      <Input
                        id="cTitle"
                        placeholder="Misal: Struktur Layout Header & Navbar"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="cDesc">Deskripsi Kustom (Custom Description)</Label>
                      <Input
                        id="cDesc"
                        placeholder="Misal: Implementasi semantic HTML5 dengan responsive container"
                        value={customDesc}
                        onChange={(e) => setCustomDesc(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="cCode">Kode Program / Baris Perintah</Label>
                      <textarea
                        id="cCode"
                        rows={6}
                        className="w-full p-3 rounded-lg border bg-slate-950 text-slate-100 font-mono text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="Ketik atau paste kode program Anda di sini..."
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowCustomModal(false)}>
                        Batal
                      </Button>
                      <Button type="submit" size="sm" className="gap-1.5">
                        <Plus className="h-4 w-4" /> Sisipkan ke Teks Materi
                      </Button>
                    </div>
                  </CardContent>
                </form>
              </Card>
            </div>
          )}

          {/* MODAL DIALOG IMPORT SOAL DARI CSV */}
          {showCsvModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <Card className="w-full max-w-lg border-amber-500/50 shadow-2xl bg-card animate-in fade-in zoom-in-95 duration-200">
                <CardHeader className="bg-muted/40 border-b flex flex-row items-center justify-between p-4 sm:p-6">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <FileSpreadsheet className="h-5 w-5 text-amber-600" /> Import Soal Kuis dari CSV
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Unggah file CSV dengan kolom pertanyaan, opsi pilihan, dan kunci jawaban.
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowCsvModal(false)} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <form onSubmit={handleImportCsv}>
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="p-4 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 space-y-3">
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        <p className="font-semibold text-foreground mb-1">Panduan Format Kolom CSV:</p>
                        <code>question_text, points, option_a, option_b, option_c, option_d, correct_option, explanation</code>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleDownloadCsvTemplate}
                        className="w-full text-xs font-bold gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" /> Unduh Contoh Template CSV
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="csvFile" className="text-xs font-bold">Pilih File CSV dari Komputer:</Label>
                      <input
                        id="csvFile"
                        type="file"
                        accept=".csv,text/csv"
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                        required
                        className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowCsvModal(false)}>
                        Batal
                      </Button>
                      <Button type="submit" disabled={importingCsv || !csvFile} size="sm" className="gap-1.5 bg-amber-600 hover:bg-amber-700 font-bold">
                        <UploadCloud className="h-4 w-4" /> {importingCsv ? 'Mengimpor...' : 'Mulai Import Soal'}
                      </Button>
                    </div>
                  </CardContent>
                </form>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

