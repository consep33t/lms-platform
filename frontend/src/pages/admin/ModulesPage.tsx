import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, BookOpen, Trash2, Edit3, CheckCircle, RefreshCw, Layers, Sparkles, X, PlusCircle, FileText } from 'lucide-react'
import api from '@/lib/api'

interface ModuleItem {
  id: number
  title: string
  description?: string
  status: string
  passing_score: number
  order: number
}

interface SessionItem {
  id: number
  module_id: number
  title: string
  description?: string
  duration_minutes: number
  order: number
}

export default function AdminModulesPage() {
  const [modules, setModules] = useState<ModuleItem[]>([])
  const [loading, setLoading] = useState(true)

  // Module Modal
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [editingModule, setEditingModule] = useState<ModuleItem | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [passingScore, setPassingScore] = useState(70)
  const [order, setOrder] = useState(1)
  const [savingModule, setSavingModule] = useState(false)

  // Session Modal
  const [activeModuleForSessions, setActiveModuleForSessions] = useState<ModuleItem | null>(null)
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [newSessionTitle, setNewSessionTitle] = useState('')
  const [newSessionDesc, setNewSessionDesc] = useState('')
  const [newSessionDuration, setNewSessionDuration] = useState(30)
  const [creatingSession, setCreatingSession] = useState(false)

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/modules')
      setModules(res.data)
    } catch (err) {
      console.error('Failed to fetch modules', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSessions = async (moduleId: number) => {
    try {
      setLoadingSessions(true)
      const res = await api.get(`/admin/modules/${moduleId}/sessions`)
      setSessions(res.data)
    } catch (err) {
      console.error('Failed to fetch sessions', err)
    } finally {
      setLoadingSessions(false)
    }
  }

  const handleOpenCreateModule = () => {
    setEditingModule(null)
    setTitle('')
    setDescription('')
    setPassingScore(70)
    setOrder(modules.length + 1)
    setShowModuleModal(true)
  }

  const handleOpenEditModule = (m: ModuleItem) => {
    setEditingModule(m)
    setTitle(m.title)
    setDescription(m.description || '')
    setPassingScore(m.passing_score)
    setOrder(m.order)
    setShowModuleModal(true)
  }

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      setSavingModule(true)
      if (editingModule) {
        await api.put(`/admin/modules/${editingModule.id}`, {
          title,
          description,
          passing_score: passingScore,
          order,
          status: editingModule.status,
        })
      } else {
        await api.post('/admin/modules', {
          title,
          description,
          passing_score: passingScore,
          order,
          status: 'published',
        })
      }
      setShowModuleModal(false)
      fetchModules()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal menyimpan modul.')
    } finally {
      setSavingModule(false)
    }
  }

  const handleDeleteModule = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus modul ini beserta seluruh sesinya?')) return
    try {
      await api.delete(`/admin/modules/${id}`)
      fetchModules()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal menghapus modul.')
    }
  }

  const handleOpenSessions = (m: ModuleItem) => {
    setActiveModuleForSessions(m)
    fetchSessions(m.id)
  }

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeModuleForSessions || !newSessionTitle.trim()) return

    try {
      setCreatingSession(true)
      await api.post(`/admin/modules/${activeModuleForSessions.id}/sessions`, {
        module_id: activeModuleForSessions.id,
        title: newSessionTitle,
        description: newSessionDesc,
        duration_minutes: newSessionDuration,
        order: sessions.length + 1,
      })
      setNewSessionTitle('')
      setNewSessionDesc('')
      setNewSessionDuration(30)
      fetchSessions(activeModuleForSessions.id)
    } catch (err) {
      alert('Gagal menambahkan sesi baru.')
    } finally {
      setCreatingSession(false)
    }
  }

  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm('Hapus sesi ini beserta seluruh isi slide dan kuisnya?')) return
    if (!activeModuleForSessions) return
    try {
      await api.delete(`/admin/modules/sessions/${sessionId}`)
      fetchSessions(activeModuleForSessions.id)
    } catch (err) {
      alert('Gagal menghapus sesi.')
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
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                <BookOpen className="h-7 w-7 text-primary" /> Kurikulum & Manajemen Modul
              </h1>
              <p className="text-sm text-muted-foreground">
                Kelola modul pembelajaran, alur sesi, materi interaktif, dan kuis evaluasi.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchModules} className="gap-1.5 shadow-sm">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
              <Button size="sm" onClick={handleOpenCreateModule} className="gap-1.5 shadow-md">
                <Plus className="h-4 w-4" /> Tambah Modul
              </Button>
            </div>
          </div>

          {/* Modal Kelola Sesi */}
          {activeModuleForSessions && (
            <Card className="border-primary/40 bg-primary/5 shadow-lg">
              <CardHeader className="bg-primary/10 border-b flex flex-row items-center justify-between p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                      <Layers className="h-4 w-4" /> Kelola Sesi Modul
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold mt-1 text-foreground">
                      {activeModuleForSessions.title}
                    </CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => fetchSessions(activeModuleForSessions.id)} className="h-8 gap-1 text-xs">
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh Sesi
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveModuleForSessions(null)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-6">
                {/* Form Tambah Sesi */}
                <form onSubmit={handleAddSession} className="p-4 rounded-xl border bg-background space-y-3 shadow-sm">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <PlusCircle className="h-4 w-4 text-primary" /> Tambah Sesi Baru ke Modul Ini
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <Input placeholder="Judul Sesi (misal: Sesi 1: Konsep Dasar)" value={newSessionTitle} onChange={(e) => setNewSessionTitle(e.target.value)} required />
                    </div>
                    <div>
                      <Input type="number" min="5" max="180" placeholder="Durasi (Menit)" value={newSessionDuration} onChange={(e) => setNewSessionDuration(parseInt(e.target.value))} required />
                    </div>
                  </div>
                  <div>
                    <Input placeholder="Deskripsi Singkat Sesi..." value={newSessionDesc} onChange={(e) => setNewSessionDesc(e.target.value)} />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={creatingSession} className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> {creatingSession ? 'Menambahkan...' : 'Tambah Sesi'}
                    </Button>
                  </div>
                </form>

                {/* Daftar Sesi Terdaftar */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                    <span>Sesi Terdaftar ({sessions.length}):</span>
                    <span className="text-[11px] font-normal text-muted-foreground">Klik 'Kelola Isi Slide & Kuis' untuk mengisi materi</span>
                  </div>
                  {loadingSessions ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">Memuat daftar sesi...</div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">Belum ada sesi di modul ini. Silakan tambahkan sesi di atas.</div>
                  ) : (
                    <div className="divide-y border rounded-xl overflow-hidden bg-background">
                      {sessions.map((s) => (
                        <div key={s.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                          <div>
                            <div className="font-bold text-sm text-foreground flex items-center gap-2">
                              <span className="h-5 w-5 rounded bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">#{s.order}</span>
                              {s.title}
                              <Badge variant="outline" className="text-xs font-mono">{s.duration_minutes} Menit</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{s.description || 'Tidak ada deskripsi'}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Link to={`/admin/modules/${activeModuleForSessions.id}/sessions/${s.id}/builder`}>
                              <Button variant="default" size="sm" className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm">
                                <FileText className="h-3.5 w-3.5" /> Kelola Isi Slide & Kuis
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0" onClick={() => handleDeleteSession(s.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
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
                <div className="p-8 text-center text-muted-foreground text-sm">Belum ada modul yang terdaftar.</div>
              ) : (
                <div className="divide-y">
                  {modules.map((m) => (
                    <div key={m.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm sm:text-base text-foreground">
                            #{m.order} {m.title}
                          </span>
                          <Badge variant={m.status === 'published' ? 'default' : 'secondary'} className="text-xs capitalize">
                            {m.status}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{m.description || 'Tidak ada deskripsi'}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 font-mono">
                          <span>KKM Kelulusan: {m.passing_score}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs border-primary/50 text-primary hover:bg-primary/10" onClick={() => handleOpenSessions(m)}>
                          <Layers className="h-3.5 w-3.5" /> Sesi
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={() => handleOpenEditModule(m)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteModule(m.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modal Form Tambah/Edit Modul */}
          {showModuleModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <Card className="w-full max-w-md border-border/80 shadow-2xl bg-card">
                <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between p-4 sm:p-6">
                  <CardTitle className="text-lg font-bold">
                    {editingModule ? 'Edit Modul Pembelajaran' : 'Tambah Modul Baru'}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowModuleModal(false)} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <form onSubmit={handleSaveModule}>
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="mtitle">Judul Modul</Label>
                      <Input id="mtitle" placeholder="Misal: DevOps & Cloud Architecture" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="mdesc">Deskripsi Silabus</Label>
                      <Input id="mdesc" placeholder="Ringkasan materi kurikulum..." value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="mscore">KKM Passing Score (%)</Label>
                        <Input id="mscore" type="number" min="1" max="100" value={passingScore} onChange={(e) => setPassingScore(parseInt(e.target.value))} required />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="morder">Urutan Tampil (#)</Label>
                        <Input id="morder" type="number" min="1" value={order} onChange={(e) => setOrder(parseInt(e.target.value))} required />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowModuleModal(false)}>Batal</Button>
                      <Button type="submit" size="sm" disabled={savingModule}>
                        {savingModule ? 'Menyimpan...' : 'Simpan Modul'}
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
