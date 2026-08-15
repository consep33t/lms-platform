import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, BookOpen, Trash2, Edit3, CheckCircle, RefreshCw, Layers, Sparkles, X, PlusCircle, FileText } from 'lucide-react'
import { SessionContentEditorModal } from '@/components/admin/SessionContentEditorModal'
import api from '@/lib/api'

interface AdminModuleItem {
  id: number
  title: string
  description: string
  status: string
  passing_score: number
  order: number
}

interface SessionItem {
  id: number
  module_id: number
  title: string
  description: string
  duration_minutes: number
  order: number
}

export default function AdminModulesPage() {
  const [modules, setModules] = useState<AdminModuleItem[]>([])
  const [loading, setLoading] = useState(true)

  // Module Modal States
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedModule, setSelectedModule] = useState<AdminModuleItem | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [passingScore, setPassingScore] = useState(70)
  const [moduleStatus, setModuleStatus] = useState('published')
  const [submitting, setSubmitting] = useState(false)

  // Session Management States
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [activeModuleForSessions, setActiveModuleForSessions] = useState<AdminModuleItem | null>(null)
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [newSessionTitle, setNewSessionTitle] = useState('')
  const [newSessionDesc, setNewSessionDesc] = useState('')
  const [newSessionDuration, setNewSessionDuration] = useState(30)
  const [creatingSession, setCreatingSession] = useState(false)
  const [selectedSessionForContent, setSelectedSessionForContent] = useState<SessionItem | null>(null)

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

  const handleOpenCreate = () => {
    setTitle('')
    setDescription('')
    setPassingScore(70)
    setModuleStatus('published')
    setShowCreateModal(true)
  }

  const handleOpenEdit = (mod: AdminModuleItem) => {
    setSelectedModule(mod)
    setTitle(mod.title)
    setDescription(mod.description)
    setPassingScore(mod.passing_score)
    setModuleStatus(mod.status)
    setShowEditModal(true)
  }

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      setSubmitting(true)
      await api.post('/admin/modules', {
        title,
        description,
        status: moduleStatus,
        passing_score: passingScore,
        order: modules.length + 1,
      })
      setShowCreateModal(false)
      fetchModules()
    } catch (err) {
      alert('Gagal membuat modul baru.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedModule || !title.trim()) return

    try {
      setSubmitting(true)
      await api.put(`/admin/modules/${selectedModule.id}`, {
        title,
        description,
        status: moduleStatus,
        passing_score: passingScore,
      })
      setShowEditModal(false)
      fetchModules()
    } catch (err) {
      alert('Gagal memperbarui modul.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus modul ini beserta seluruh sesinya?')) return
    try {
      await api.delete(`/admin/modules/${moduleId}`)
      fetchModules()
    } catch (err) {
      alert('Gagal menghapus modul.')
    }
  }

  // Session Manager Actions
  const handleOpenSessionManager = async (mod: AdminModuleItem) => {
    setActiveModuleForSessions(mod)
    setShowSessionModal(true)
    fetchSessions(mod.id)
  }

  const fetchSessions = async (moduleId: number) => {
    try {
      setLoadingSessions(true)
      const res = await api.get(`/admin/modules/${moduleId}/sessions`)
      setSessions(res.data)
    } catch (err) {
      console.error('Failed to fetch module sessions', err)
    } finally {
      setLoadingSessions(false)
    }
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
    if (!confirm('Hapus sesi pembelajaran ini?')) return
    try {
      await api.delete(`/admin/modules/sessions/${sessionId}`)
      if (activeModuleForSessions) fetchSessions(activeModuleForSessions.id)
    } catch (err) {
      alert('Gagal menghapus sesi.')
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
              <p className="text-muted-foreground text-sm">Kelola modul pembelajaran, sesi, konten slide, dan standar kelulusan KKM.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchModules} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
              <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 shadow">
                <Plus className="h-4 w-4" /> Tambah Modul Baru
              </Button>
            </div>
          </div>

          {/* Form Modal Create Modul */}
          {showCreateModal && (
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
                    <Label htmlFor="mdesc">Deskripsi Singkat Silabus</Label>
                    <Input id="mdesc" placeholder="Penjelasan silabus modul..." value={description} onChange={(e) => setDescription(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="mscore">Standar Kelulusan KKM (%)</Label>
                      <Input id="mscore" type="number" min="50" max="100" value={passingScore} onChange={(e) => setPassingScore(parseInt(e.target.value))} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="mstatus">Status Modul</Label>
                      <select id="mstatus" className="w-full h-10 px-3 rounded-md border bg-background text-sm" value={moduleStatus} onChange={(e) => setModuleStatus(e.target.value)}>
                        <option value="published">Published (Aktif)</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
                <div className="p-4 bg-muted/30 border-t flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Batal</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan & Publikasikan'}</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Form Modal Edit Modul */}
          {showEditModal && (
            <Card className="border-primary/40 bg-muted/20 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Edit Modul: {selectedModule?.title}</CardTitle>
              </CardHeader>
              <form onSubmit={handleUpdateModule}>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="etitle">Judul Modul</Label>
                    <Input id="etitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="edesc">Deskripsi Singkat</Label>
                    <Input id="edesc" value={description} onChange={(e) => setDescription(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="escore">Standar Kelulusan KKM (%)</Label>
                      <Input id="escore" type="number" min="50" max="100" value={passingScore} onChange={(e) => setPassingScore(parseInt(e.target.value))} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="estatus">Status Modul</Label>
                      <select id="estatus" className="w-full h-10 px-3 rounded-md border bg-background text-sm" value={moduleStatus} onChange={(e) => setModuleStatus(e.target.value)}>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
                <div className="p-4 bg-muted/30 border-t flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}>Batal</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Memperbarui...' : 'Simpan Perubahan'}</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Modal Kelola Sesi Modul */}
          {showSessionModal && activeModuleForSessions && (
            <Card className="border-2 border-primary/50 shadow-xl">
              <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Kelola Sesi: {activeModuleForSessions.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">Daftar sesi pembelajaran di dalam modul ini</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowSessionModal(false)}><X className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Form Tambah Sesi Baru */}
                <form onSubmit={handleAddSession} className="p-4 rounded-xl border bg-muted/20 space-y-3">
                  <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <PlusCircle className="h-4 w-4 text-primary" /> Tambah Sesi Baru
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
                    <Button type="submit" size="sm" disabled={creatingSession}>
                      {creatingSession ? 'Menambahkan...' : 'Tambah Sesi'}
                    </Button>
                  </div>
                </form>

                {/* Daftar Sesi Terdaftar */}
                <div className="space-y-3">
                  <div className="text-sm font-bold text-muted-foreground">Sesi Terdaftar ({sessions.length}):</div>
                  {loadingSessions ? (
                    <div className="text-center py-4 text-xs text-muted-foreground">Memuat sesi...</div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-4 text-xs text-muted-foreground">Belum ada sesi di modul ini.</div>
                  ) : (
                    <div className="divide-y border rounded-xl overflow-hidden">
                      {sessions.map((s) => (
                        <div key={s.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/20">
                          <div>
                            <div className="font-bold text-sm text-foreground flex items-center gap-2">
                              #{s.order} {s.title}
                              <Badge variant="outline" className="text-xs">{s.duration_minutes} Menit</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{s.description || 'Tidak ada deskripsi'}</p>
                          </div>
                          <div className="flex items-center gap-2">
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
                <div className="p-8 text-center text-muted-foreground text-sm">Belum ada modul.</div>
              ) : (
                <div className="divide-y">
                  {modules.map((m) => (
                    <div key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                          #{m.order}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground flex items-center gap-2">
                            {m.title}
                            <Badge variant={m.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                              {m.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{m.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="font-mono text-xs">KKM: {m.passing_score}%</Badge>
                        <Button variant="outline" size="sm" onClick={() => handleOpenSessionManager(m)} className="gap-1 text-xs">
                          <Layers className="h-3.5 w-3.5 text-blue-500" /> Sesi
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenEdit(m)} className="gap-1 text-xs">
                          <Edit3 className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteModule(m.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
                {selectedSessionForContent && (
          <SessionContentEditorModal
            sessionId={selectedSessionForContent.id}
            sessionTitle={selectedSessionForContent.title}
            onClose={() => setSelectedSessionForContent(null)}
          />
        )}
        </main>
      </div>
    </div>
  )
}
