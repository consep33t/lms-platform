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
  Layers
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
  const [textBody, setTextBody] = useState(`## 1. Panduan Praktikum Command Line
Jalankan perintah berikut di terminal:

\`\`\`bash
# Memeriksa port layanan aktif
ss -tulpn | grep :8088
docker ps -a
\`\`\`

\`\`\`powershell
# Menguji koneksi jaringan port
Test-NetConnection -ComputerName 192.168.10.100 -Port 8088
\`\`\`

\`\`\`cmd
# Memeriksa konfigurasi IP
ipconfig /all
\`\`\``)
  const [savingText, setSavingText] = useState(false)

  // Media Upload States
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadingMedia, setUploadingMedia] = useState(false)

  // Quiz States
  const [quizQuestion, setQuizQuestion] = useState('')
  const [opt1, setOpt1] = useState('')
  const [opt2, setOpt2] = useState('')
  const [opt3, setOpt3] = useState('')
  const [opt4, setOpt4] = useState('')
  const [correctOptIdx, setCorrectOptIdx] = useState(1)
  const [savingQuiz, setSavingQuiz] = useState(false)

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
Jalankan perintah berikut di terminal Linux:

\`\`\`bash
# Periksa status service dan port jaringan
ss -tulpn | grep -E ':80|:443|:8088'
curl -I https://lms.consep33t.my.id
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
\`\`\``)
  }

  const insertPowerShell = () => {
    insertSnippet(`## Perintah Windows PowerShell
Jalankan cmdlet PowerShell berikut:

\`\`\`powershell
# Uji konektivitas port TCP
Test-NetConnection -ComputerName 192.168.10.100 -Port 8088
Get-Service -Name "docker" | Select-Object Status, StartType
Invoke-RestMethod -Uri "https://lms.consep33t.my.id/api/v1/health"
\`\`\``)
  }

  const insertCmd = () => {
    insertSnippet(`## Perintah Windows Command Prompt (CMD)
Jalankan di jendela CMD:

\`\`\`cmd
netstat -ano | findstr :8088
ping -n 4 192.168.10.100
systeminfo | findstr /B /C:"OS Name"
\`\`\``)
  }

  const insertPython = () => {
    insertSnippet(`## Implementasi Kode Python
Berikut adalah fungsi pemrosesan asynchronous:

\`\`\`python
import asyncio
from fastapi import FastAPI

app = FastAPI(title="LMS Core")

@app.get("/api/status")
async def get_status():
    return {"status": "operational", "latency_ms": 1.2}
\`\`\``)
  }

  const insertYaml = () => {
    insertSnippet(`## Konfigurasi Kubernetes Manifest YAML
Berikut adalah definisi deployment service:

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: core-app
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: web
        image: lms_backend_prod:latest
\`\`\``)
  }

  const insertDocker = () => {
    insertSnippet(`## Dockerfile Multi-Stage Build
Berikut adalah arsitektur container image:

\`\`\`dockerfile
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8088"]
\`\`\``)
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
    if (!quizQuestion.trim() || !opt1.trim() || !opt2.trim()) return

    const options = [
      { option_text: opt1, is_correct: correctOptIdx === 1, order: 1 },
      { option_text: opt2, is_correct: correctOptIdx === 2, order: 2 },
    ]
    if (opt3.trim()) options.push({ option_text: opt3, is_correct: correctOptIdx === 3, order: 3 })
    if (opt4.trim()) options.push({ option_text: opt4, is_correct: correctOptIdx === 4, order: 4 })

    const nextOrder = (sessionDetail?.steps?.length || 0) + 1
    try {
      setSavingQuiz(true)
      await api.post(`/admin/modules/sessions/${sessionId}/questions`, {
        session_id: parseInt(sessionId!),
        question_text: quizQuestion,
        points: 1,
        order: nextOrder,
        is_reusable: false,
        options: options
      })
      alert('Soal kuis checkpoint berhasil ditambahkan ke sesi!')
      setQuizQuestion('')
      setOpt1('')
      setOpt2('')
      setOpt3('')
      setOpt4('')
      setCorrectOptIdx(1)
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
                    <Code2 className="h-4 w-4" /> Slide Teks & CLI / Code
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
                        <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          ⚡ <strong>Quick Snippet Toolbar</strong> (Klik untuk menyisipkan blok kode/command):
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={insertBash} className="gap-1 text-xs border-sky-500/50 text-sky-400 bg-sky-950/40 hover:bg-sky-900/60">
                            <Terminal className="h-3.5 w-3.5" /> + Bash / Linux
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={insertPowerShell} className="gap-1 text-xs border-blue-500/50 text-blue-400 bg-blue-950/40 hover:bg-blue-900/60">
                            <Terminal className="h-3.5 w-3.5" /> + PowerShell
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={insertCmd} className="gap-1 text-xs border-amber-500/50 text-amber-400 bg-amber-950/40 hover:bg-amber-900/60">
                            <Terminal className="h-3.5 w-3.5" /> + CMD Windows
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={insertPython} className="gap-1 text-xs border-emerald-500/50 text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60">
                            <Code2 className="h-3.5 w-3.5" /> + Python
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={insertYaml} className="gap-1 text-xs border-purple-500/50 text-purple-400 bg-purple-950/40 hover:bg-purple-900/60">
                            <Code2 className="h-3.5 w-3.5" /> + YAML Config
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={insertDocker} className="gap-1 text-xs border-cyan-500/50 text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/60">
                            <Code2 className="h-3.5 w-3.5" /> + Dockerfile
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
                      <div className="space-y-1">
                        <Label htmlFor="qTitle" className="text-sm font-semibold">Pertanyaan Evaluasi Checkpoint</Label>
                        <Input
                          id="qTitle"
                          placeholder="Misal: Perintah apa yang digunakan untuk memeriksa status container Docker?"
                          value={quizQuestion}
                          onChange={(e) => setQuizQuestion(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Pilihan Jawaban (Pilih radio untuk menentukan kunci jawaban yang benar):</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 p-2.5 border rounded-xl bg-muted/20">
                            <input type="radio" name="cOpt" checked={correctOptIdx === 1} onChange={() => setCorrectOptIdx(1)} />
                            <Input placeholder="Pilihan A" value={opt1} onChange={(e) => setOpt1(e.target.value)} required />
                          </div>
                          <div className="flex items-center gap-2 p-2.5 border rounded-xl bg-muted/20">
                            <input type="radio" name="cOpt" checked={correctOptIdx === 2} onChange={() => setCorrectOptIdx(2)} />
                            <Input placeholder="Pilihan B" value={opt2} onChange={(e) => setOpt2(e.target.value)} required />
                          </div>
                          <div className="flex items-center gap-2 p-2.5 border rounded-xl bg-muted/20">
                            <input type="radio" name="cOpt" checked={correctOptIdx === 3} onChange={() => setCorrectOptIdx(3)} />
                            <Input placeholder="Pilihan C (Opsional)" value={opt3} onChange={(e) => setOpt3(e.target.value)} />
                          </div>
                          <div className="flex items-center gap-2 p-2.5 border rounded-xl bg-muted/20">
                            <input type="radio" name="cOpt" checked={correctOptIdx === 4} onChange={() => setCorrectOptIdx(4)} />
                            <Input placeholder="Pilihan D (Opsional)" value={opt4} onChange={(e) => setOpt4(e.target.value)} />
                          </div>
                        </div>
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
        </main>
      </div>
    </div>
  )
}
