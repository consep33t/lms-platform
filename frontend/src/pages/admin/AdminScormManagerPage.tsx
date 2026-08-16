import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScormPlayer } from '@/components/scorm/ScormPlayer'
import { UploadCloud, FileType, PlayCircle, X, Sparkles } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/context/FeedbackContext'

export default function AdminScormManagerPage() {
  usePageTitle('Manajemen Paket SCORM & xAPI — CMS Admin')
  const { success } = useToast()
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
      success('Paket SCORM Diterima', `File ${e.dataTransfer.files[0].name} siap diproses.`)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      success('Paket SCORM Dipilih', `File ${e.target.files[0].name} siap diproses.`)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto animate-page-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-foreground">
          Manajemen Paket SCORM & xAPI
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Unggah paket SCORM 1.2 / SCORM 2004, validasi IMS Manifest XML, dan simpan interaktivitas kursus.
        </p>
      </div>

      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold font-display flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-primary" /> Unggah Paket Pembelajaran
          </CardTitle>
          <CardDescription>Format file yang didukung: Archive ZIP berstandar SCORM / xAPI</CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                  <FileType className="w-10 h-10" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-base">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB • Siap dieksekusi</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" onClick={() => setFile(null)} className="rounded-xl">Batal</Button>
                  <Button onClick={() => setIsPreviewOpen(true)} className="rounded-xl gap-1.5 shadow-sm">
                    <PlayCircle className="w-4 h-4" /> Uji Coba SCORM
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-muted/60 rounded-2xl text-muted-foreground">
                  <UploadCloud className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-sm">Tarik & Lepas File ZIP di Sini</p>
                  <p className="text-xs text-muted-foreground">atau klik tombol di bawah untuk memilih file dari komputer</p>
                </div>
                <input 
                  type="file" 
                  accept=".zip" 
                  className="hidden" 
                  id="scorm-upload"
                  onChange={handleFileSelect}
                />
                <Button variant="outline" onClick={() => document.getElementById('scorm-upload')?.click()} className="rounded-xl mt-2">
                  Pilih File ZIP
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Package Manifest Preview */}
      {file && (
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold font-display flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Rincian Manifest IMS (Hasil Parse)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/40 p-4 rounded-xl text-sm space-y-2 font-mono text-xs">
              <p><strong className="font-sans text-foreground">Judul Modul:</strong> Paket Kursus Interaktif SCORM 2004</p>
              <p><strong className="font-sans text-foreground">Versi Standar:</strong> SCORM 2004 4th Edition</p>
              <p><strong className="font-sans text-foreground">Batas Kelulusan:</strong> 80%</p>
              <p><strong className="font-sans text-foreground">Entry Point HTML:</strong> index_lms.html</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Launch Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-page-in">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[85vh] animate-scale-in">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h2 className="text-lg font-bold font-display text-foreground">Simulasi SCORM Player</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsPreviewOpen(false)} className="rounded-xl">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 bg-muted/20 p-4 overflow-auto">
              <ScormPlayer 
                entryUrl="/mock-scorm/index.html" 
                onCompleted={() => success('Simulasi Selesai!', 'Siswa telah menuntaskan seluruh materi SCORM.')}
                onProgress={(p) => console.log('Progress:', p)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
