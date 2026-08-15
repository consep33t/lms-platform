import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, BookOpen, Trash2, Edit3, CheckCircle, RefreshCw } from 'lucide-react'
import api from '@/lib/api'

interface AdminModuleItem {
  id: number
  title: string
  description: string
  status: string
  passing_score: number
  order: number
}

export default function AdminModulesPage() {
  const [modules, setModules] = useState<AdminModuleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [passingScore, setPassingScore] = useState(70)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/modules')
      setModules(res.data)
    } catch (err) {
      console.error('Failed to fetch admin modules', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      setSubmitting(true)
      await api.post('/admin/modules', {
        title,
        description,
        status: 'published',
        passing_score: passingScore,
        order: modules.length + 1,
      })
      setTitle('')
      setDescription('')
      setShowModal(false)
      fetchModules()
    } catch (err) {
      alert('Gagal membuat modul baru.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Manajemen Modul & Kurikulum</h1>
              <p className="text-muted-foreground text-sm">Kelola modul pembelajaran, bobot kelulusan kuis, dan status publikasi.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchModules} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
              <Button size="sm" onClick={() => setShowModal(true)} className="gap-1.5 shadow">
                <Plus className="h-4 w-4" /> Tambah Modul Baru
              </Button>
            </div>
          </div>

          {/* Form Modal Create */}
          {showModal && (
            <Card className="border-primary/40 bg-muted/20 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Form Tambah Modul Baru</CardTitle>
              </CardHeader>
              <form onSubmit={handleCreateModule}>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="mtitle">Judul Modul</Label>
                    <Input id="mtitle" placeholder="Misal: Arsitektur Cloud Native" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="mdesc">Deskripsi Singkat</Label>
                    <Input id="mdesc" placeholder="Penjelasan silabus modul..." value={description} onChange={(e) => setDescription(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="mscore">Standar Kelulusan KKM (%)</Label>
                    <Input id="mscore" type="number" min="50" max="100" value={passingScore} onChange={(e) => setPassingScore(parseInt(e.target.value))} required />
                  </div>
                </CardContent>
                <div className="p-4 bg-muted/30 border-t flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Batal</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan & Publikasikan'}</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Tabel Modul */}
          <Card className="border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle className="text-base font-bold">Daftar Modul Terdaftar ({modules.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Memuat data modul...</div>
              ) : modules.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Belum ada modul.</div>
              ) : (
                <div className="divide-y">
                  {modules.map((m) => (
                    <div key={m.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                          #{m.order}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground flex items-center gap-2">
                            {m.title}
                            <Badge variant="outline" className="text-xs">{m.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{m.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="secondary" className="font-mono text-xs">KKM: {m.passing_score}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
