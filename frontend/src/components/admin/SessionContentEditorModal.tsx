import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Plus, Terminal, Code2, Sparkles, Video, HelpCircle, FileText, Trash2, CheckCircle2 } from 'lucide-react'
import api from '@/lib/api'

interface SessionContentEditorModalProps {
  sessionId: number
  sessionTitle: string
  onClose: () => void
}

export function SessionContentEditorModal({ sessionId, sessionTitle, onClose }: SessionContentEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'video' | 'quiz'>('text')
  const [textBody, setTextBody] = useState('')
  const [mediaFileId, setMediaFileId] = useState<number | ''>('')
  const [slideOrder, setSlideOrder] = useState(1)
  const [savingContent, setSavingContent] = useState(false)

  // Quiz Form States
  const [questionText, setQuestionText] = useState('')
  const [opt1, setOpt1] = useState('')
  const [opt2, setOpt2] = useState('')
  const [opt3, setOpt3] = useState('')
  const [opt4, setOpt4] = useState('')
  const [correctOptIdx, setCorrectOptIdx] = useState(1)
  const [savingQuiz, setSavingQuiz] = useState(false)

  // Quick Snippet Insert Helpers
  const insertSnippet = (snippet: string) => {
    setTextBody((prev) => (prev ? `${prev}\n\n${snippet}` : snippet))
  }

  const insertBash = () => {
    insertSnippet(`## Perintah Terminal Linux / Bash
Gunakan perintah berikut di terminal:

\`\`\`bash
# Memeriksa status service dan port aktif
ss -tulpn | grep :8088
docker ps --filter "name=lms"
\`\`\``)
  }

  const insertPowerShell = () => {
    insertSnippet(`## Perintah Windows PowerShell
Jalankan cmdlet PowerShell berikut:

\`\`\`powershell
# Menguji koneksi TCP port
Test-NetConnection -ComputerName 192.168.10.100 -Port 8088
Get-Service -Name "docker"
\`\`\``)
  }

  const insertCmd = () => {
    insertSnippet(`## Perintah Command Prompt (CMD)
Jalankan di jendela CMD Windows:

\`\`\`cmd
netstat -ano | findstr :8088
ping -n 4 192.168.10.100
\`\`\``)
  }

  const insertCodeBlock = () => {
    insertSnippet(`## Implementasi Kode YAML & Python
Berikut adalah contoh struktur konfigurasi dan implementasi:

\`\`\`yaml
apiVersion: enterprise.lms.io/v1
kind: ClusterService
metadata:
  name: core-service
spec:
  replicas: 3
\`\`\`

\`\`\`python
def execute_task(payload: dict) -> bool:
    print(f"Processing: {payload}")
    return True
\`\`\``)
  }

  const handleSaveTextSlide = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!textBody.trim()) return

    try {
      setSavingContent(true)
      await api.post(`/admin/modules/sessions/${sessionId}/contents?content_type=text&order=${slideOrder}`, {
        text_body: textBody
      })
      alert('Slide teks berhasil ditambahkan!')
      setTextBody('')
      setSlideOrder((prev) => prev + 1)
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal menyimpan slide teks.')
    } finally {
      setSavingContent(false)
    }
  }

  const handleSaveMediaSlide = async (e: React.FormEvent, type: 'image' | 'video') => {
    e.preventDefault()
    if (!mediaFileId) return

    try {
      setSavingContent(true)
      await api.post(`/admin/modules/sessions/${sessionId}/contents?content_type=${type}&media_file_id=${mediaFileId}&order=${slideOrder}`)
      alert(`Slide ${type === 'image' ? 'gambar' : 'video'} berhasil ditambahkan!`)
      setMediaFileId('')
      setSlideOrder((prev) => prev + 1)
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal menyimpan slide media.')
    } finally {
      setSavingContent(false)
    }
  }

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText.trim() || !opt1.trim() || !opt2.trim()) return

    const options = [
      { option_text: opt1, is_correct: correctOptIdx === 1, order: 1 },
      { option_text: opt2, is_correct: correctOptIdx === 2, order: 2 },
    ]
    if (opt3.trim()) options.push({ option_text: opt3, is_correct: correctOptIdx === 3, order: 3 })
    if (opt4.trim()) options.push({ option_text: opt4, is_correct: correctOptIdx === 4, order: 4 })

    try {
      setSavingQuiz(true)
      await api.post(`/admin/modules/sessions/${sessionId}/questions`, {
        session_id: sessionId,
        question_text: questionText,
        points: 1,
        order: slideOrder,
        is_reusable: false,
        options: options
      })
      alert('Soal kuis checkpoint berhasil ditambahkan!')
      setQuestionText('')
      setOpt1('')
      setOpt2('')
      setOpt3('')
      setOpt4('')
      setCorrectOptIdx(1)
      setSlideOrder((prev) => prev + 1)
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal menyimpan kuis.')
    } finally {
      setSavingQuiz(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col border-primary/50 shadow-2xl bg-card">
        {/* Header */}
        <CardHeader className="bg-muted/40 border-b flex flex-row items-center justify-between p-4 sm:p-6 shrink-0">
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Editor Konten Sesi
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{sessionTitle}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0"><X className="h-4 w-4" /></Button>
        </CardHeader>

        {/* Tab Navigation */}
        <div className="flex border-b bg-muted/20 px-4 sm:px-6 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('text')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'text' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Code2 className="h-4 w-4" /> Slide Teks & Code / CLI
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'image' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-4 w-4" /> Slide Gambar Diagram
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'video' ? 'border-blue-500 text-blue-600' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Video className="h-4 w-4" /> Slide Video Demo
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'quiz' ? 'border-amber-500 text-amber-600' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <HelpCircle className="h-4 w-4" /> Checkpoint Kuis
          </button>
        </div>

        {/* Content Body */}
        <CardContent className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: SLIDE TEKS & CODE/CLI */}
          {activeTab === 'text' && (
            <form onSubmit={handleSaveTextSlide} className="space-y-4">
              {/* Quick Snippet Toolbar */}
              <div className="p-3 rounded-lg border bg-muted/40 space-y-2">
                <div className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  ⚡ <strong>Quick Insert Snippet Toolbar</strong> (Klik untuk menyisipkan format):
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={insertBash} className="gap-1 text-xs border-sky-500/50 hover:bg-sky-500/10 text-sky-400">
                    <Terminal className="h-3.5 w-3.5" /> + Bash / Linux
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={insertPowerShell} className="gap-1 text-xs border-blue-500/50 hover:bg-blue-500/10 text-blue-400">
                    <Terminal className="h-3.5 w-3.5" /> + PowerShell
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={insertCmd} className="gap-1 text-xs border-amber-500/50 hover:bg-amber-500/10 text-amber-400">
                    <Terminal className="h-3.5 w-3.5" /> + CMD Prompt
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={insertCodeBlock} className="gap-1 text-xs border-indigo-500/50 hover:bg-indigo-500/10 text-indigo-400">
                    <Code2 className="h-3.5 w-3.5" /> + Code (YAML/Python)
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sbody">Isi Teks Materi (Mendukung Markdown & Fenced Blocks)</Label>
                  <span className="text-[11px] text-muted-foreground font-mono">Urutan Slide: #{slideOrder}</span>
                </div>
                <textarea
                  id="sbody"
                  rows={10}
                  className="w-full p-3 rounded-lg border bg-background font-mono text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Tulis materi pembelajaran di sini... Gunakan ```bash untuk terminal bash, ```powershell untuk powershell, dll."
                  value={textBody}
                  onChange={(e) => setTextBody(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={savingContent} className="gap-1.5">
                  <Plus className="h-4 w-4" /> {savingContent ? 'Menyimpan...' : 'Tambahkan Slide Teks'}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: SLIDE GAMBAR DIAGRAM */}
          {activeTab === 'image' && (
            <form onSubmit={(e) => handleSaveMediaSlide(e, 'image')} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="mimg">ID File Media Gambar (dari tabel media_files / upload)</Label>
                <Input id="mimg" type="number" placeholder="Misal: 1" value={mediaFileId} onChange={(e) => setMediaFileId(e.target.value ? parseInt(e.target.value) : '')} required />
              </div>
              <Button type="submit" disabled={savingContent} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4" /> {savingContent ? 'Menyimpan...' : 'Tambahkan Slide Gambar'}
              </Button>
            </form>
          )}

          {/* TAB 3: SLIDE VIDEO DEMO */}
          {activeTab === 'video' && (
            <form onSubmit={(e) => handleSaveMediaSlide(e, 'video')} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="mvid">ID File Media Video (dari tabel media_files / upload)</Label>
                <Input id="mvid" type="number" placeholder="Misal: 2" value={mediaFileId} onChange={(e) => setMediaFileId(e.target.value ? parseInt(e.target.value) : '')} required />
              </div>
              <Button type="submit" disabled={savingContent} className="gap-1.5 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" /> {savingContent ? 'Menyimpan...' : 'Tambahkan Slide Video'}
              </Button>
            </form>
          )}

          {/* TAB 4: CHECKPOINT KUIS */}
          {activeTab === 'quiz' && (
            <form onSubmit={handleSaveQuiz} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="qtext">Pertanyaan Soal Kuis</Label>
                <Input id="qtext" placeholder="Tuliskan pertanyaan evaluasi..." value={questionText} onChange={(e) => setQuestionText(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Pilihan Jawaban (Pilih radio untuk menentukan kunci jawaban yang benar):</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/20">
                    <input type="radio" name="correctOpt" checked={correctOptIdx === 1} onChange={() => setCorrectOptIdx(1)} />
                    <Input placeholder="Pilihan A" value={opt1} onChange={(e) => setOpt1(e.target.value)} required />
                  </div>
                  <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/20">
                    <input type="radio" name="correctOpt" checked={correctOptIdx === 2} onChange={() => setCorrectOptIdx(2)} />
                    <Input placeholder="Pilihan B" value={opt2} onChange={(e) => setOpt2(e.target.value)} required />
                  </div>
                  <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/20">
                    <input type="radio" name="correctOpt" checked={correctOptIdx === 3} onChange={() => setCorrectOptIdx(3)} />
                    <Input placeholder="Pilihan C (Opsional)" value={opt3} onChange={(e) => setOpt3(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/20">
                    <input type="radio" name="correctOpt" checked={correctOptIdx === 4} onChange={() => setCorrectOptIdx(4)} />
                    <Input placeholder="Pilihan D (Opsional)" value={opt4} onChange={(e) => setOpt4(e.target.value)} />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={savingQuiz} className="gap-1.5 bg-amber-600 hover:bg-amber-700">
                <Plus className="h-4 w-4" /> {savingQuiz ? 'Menyimpan...' : 'Tambahkan Kuis Checkpoint'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
