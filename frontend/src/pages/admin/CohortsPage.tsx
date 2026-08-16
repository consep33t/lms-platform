import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Users2,
  Plus,
  RefreshCw,
  Layers,
  Edit2,
  Trash2,
  UserPlus,
  BookOpen,
  X,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import api from '@/lib/api'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useConfirm } from '@/context/FeedbackContext'

interface CohortItem {
  id: number
  name: string
  description: string | null
  member_count: number
  assignment_count: number
  created_at: string
}

interface CohortMember {
  id: number
  user_id: number
  full_name: string
  email: string
  phone_number: string | null
  institution: string | null
  joined_at: string
}

interface ModuleAssignment {
  id: number
  module_id: number
  module_title: string
  cohort_id: number
  due_date: string | null
  created_at: string
}

interface SimpleUser {
  id: number
  full_name: string
  email: string
  institution: string | null
}

interface SimpleModule {
  id: number
  title: string
  status: string
}

export default function AdminCohortsPage() {
  usePageTitle('Manajemen Grup & Cohort — CMS Admin')
  const confirm = useConfirm()
  const [cohorts, setCohorts] = useState<CohortItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Edit state
  const [editingCohort, setEditingCohort] = useState<CohortItem | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  // Members Modal state
  const [activeCohortForMembers, setActiveCohortForMembers] = useState<CohortItem | null>(null)
  const [members, setMembers] = useState<CohortMember[]>([])
  const [allUsers, setAllUsers] = useState<SimpleUser[]>([])
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  // Assignments Modal state
  const [activeCohortForAssignments, setActiveCohortForAssignments] = useState<CohortItem | null>(null)
  const [assignments, setAssignments] = useState<ModuleAssignment[]>([])
  const [allModules, setAllModules] = useState<SimpleModule[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState<number | ''>('')
  const [assignmentDueDate, setAssignmentDueDate] = useState('')
  const [loadingAssignments, setLoadingAssignments] = useState(false)

  // Toast / Alert notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3500)
  }

  useEffect(() => {
    fetchCohorts()
  }, [])

  const fetchCohorts = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/cohorts')
      setCohorts(res.data)
    } catch (err) {
      console.error('Failed to fetch cohorts', err)
      showToast('Gagal memuat daftar cohort.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      setSubmitting(true)
      await api.post('/admin/cohorts', { name: name.trim(), description })
      setName('')
      setDescription('')
      setShowCreateModal(false)
      showToast('Cohort berhasil dibuat!')
      fetchCohorts()
    } catch (err) {
      showToast('Gagal membuat grup cohort.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateCohort = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCohort || !editName.trim()) return

    try {
      setSubmitting(true)
      await api.put(`/admin/cohorts/${editingCohort.id}`, {
        name: editName.trim(),
        description: editDescription,
      })
      setEditingCohort(null)
      showToast('Cohort berhasil diperbarui!')
      fetchCohorts()
    } catch (err) {
      showToast('Gagal memperbarui cohort.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCohort = async (id: number, cname: string) => {
    const ok = await confirm({
      title: 'Hapus Grup Cohort?',
      message: `Apakah Anda yakin ingin menghapus cohort "${cname}"? Data penugasan dan relasi peserta pada cohort ini akan dibersihkan.`,
      confirmText: 'Ya, Hapus Cohort',
      variant: 'destructive',
    })
    if (!ok) return

    try {
      await api.delete(`/admin/cohorts/${id}`)
      showToast(`Cohort "${cname}" berhasil dihapus.`)
      fetchCohorts()
    } catch (err) {
      showToast('Gagal menghapus cohort.', 'error')
    }
  }

  // ─── Members Logic ───────────────────────────────────────────────────────────

  const openMembersModal = async (cohort: CohortItem) => {
    setActiveCohortForMembers(cohort)
    setSelectedUserIds([])
    setMemberSearchQuery('')
    setLoadingMembers(true)
    try {
      const [membersRes, usersRes] = await Promise.all([
        api.get(`/admin/cohorts/${cohort.id}/members`),
        api.get('/admin/users'),
      ])
      setMembers(membersRes.data)
      setAllUsers(usersRes.data)
    } catch (err) {
      showToast('Gagal memuat data anggota.', 'error')
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleAddMembers = async () => {
    if (!activeCohortForMembers || selectedUserIds.length === 0) return

    try {
      setSubmitting(true)
      await api.post(`/admin/cohorts/${activeCohortForMembers.id}/members`, {
        user_ids: selectedUserIds,
      })
      showToast(`${selectedUserIds.length} peserta berhasil ditambahkan!`)
      setSelectedUserIds([])
      // Refresh member list
      const res = await api.get(`/admin/cohorts/${activeCohortForMembers.id}/members`)
      setMembers(res.data)
      fetchCohorts()
    } catch (err) {
      showToast('Gagal menambahkan anggota.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveMember = async (userId: number, memberName: string) => {
    if (!activeCohortForMembers) return
    const ok = await confirm({
      title: 'Hapus Anggota Cohort?',
      message: `Keluarkan ${memberName} dari grup cohort ini?`,
      confirmText: 'Keluarkan Peserta',
      variant: 'destructive',
    })
    if (!ok) return

    try {
      await api.delete(`/admin/cohorts/${activeCohortForMembers.id}/members/${userId}`)
      showToast(`${memberName} dihapus dari cohort.`)
      setMembers((prev) => prev.filter((m) => m.user_id !== userId))
      fetchCohorts()
    } catch (err) {
      showToast('Gagal menghapus anggota.', 'error')
    }
  }

  // ─── Assignments Logic ───────────────────────────────────────────────────────

  const openAssignmentsModal = async (cohort: CohortItem) => {
    setActiveCohortForAssignments(cohort)
    setSelectedModuleId('')
    setAssignmentDueDate('')
    setLoadingAssignments(true)
    try {
      const [assignRes, modRes] = await Promise.all([
        api.get(`/admin/cohorts/${cohort.id}/assignments`),
        api.get('/admin/modules'),
      ])
      setAssignments(assignRes.data)
      setAllModules(modRes.data)
    } catch (err) {
      showToast('Gagal memuat data penugasan.', 'error')
    } finally {
      setLoadingAssignments(false)
    }
  }

  const handleAssignModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeCohortForAssignments || !selectedModuleId) return

    try {
      setSubmitting(true)
      await api.post(`/admin/cohorts/${activeCohortForAssignments.id}/assignments`, {
        module_id: Number(selectedModuleId),
        due_date: assignmentDueDate ? new Date(assignmentDueDate).toISOString() : null,
      })
      showToast('Modul berhasil ditugaskan ke cohort!')
      setSelectedModuleId('')
      setAssignmentDueDate('')
      // Refresh assignments
      const res = await api.get(`/admin/cohorts/${activeCohortForAssignments.id}/assignments`)
      setAssignments(res.data)
      fetchCohorts()
    } catch (err) {
      showToast('Gagal menugaskan modul.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveAssignment = async (assignmentId: number) => {
    if (!activeCohortForAssignments) return
    const ok = await confirm({
      title: 'Batalkan Penugasan Modul?',
      message: 'Apakah Anda yakin ingin membatalkan penugasan modul ini untuk seluruh anggota cohort?',
      confirmText: 'Batalkan Penugasan',
      variant: 'warning',
    })
    if (!ok) return

    try {
      await api.delete(`/admin/cohorts/${activeCohortForAssignments.id}/assignments/${assignmentId}`)
      showToast('Penugasan modul dibatalkan.')
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId))
      fetchCohorts()
    } catch (err) {
      showToast('Gagal membatalkan penugasan modul.', 'error')
    }
  }

  // Filter available users not already in cohort
  const existingMemberUserIds = new Set(members.map((m) => m.user_id))
  const availableUsers = allUsers.filter(
    (u) =>
      !existingMemberUserIds.has(u.id) &&
      (u.full_name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
        (u.institution && u.institution.toLowerCase().includes(memberSearchQuery.toLowerCase())))
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-6">
          {/* Notification Alert */}
          {notification && (
            <div
              className={`p-4 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 ${
                notification.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600'
                  : 'bg-destructive/10 border border-destructive/20 text-destructive'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                {notification.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {notification.message}
              </div>
              <button onClick={() => setNotification(null)} className="text-xs opacity-60 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Manajemen Grup & Cohort Peserta</h1>
              <p className="text-muted-foreground text-sm">
                Kelompokkan peserta ke dalam angkatan, kelola anggota, dan jadwalkan penugasan modul dengan deadline.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchCohorts} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
              <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-1.5 shadow">
                <Plus className="h-4 w-4" /> Buat Cohort Baru
              </Button>
            </div>
          </div>

          {/* Form Buat Cohort */}
          {showCreateModal && (
            <Card className="border-primary/40 bg-muted/20 shadow-md animate-in fade-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Form Tambah Cohort / Angkatan</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <form onSubmit={handleCreateCohort}>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="cname">Nama Grup / Angkatan</Label>
                    <Input
                      id="cname"
                      placeholder="Misal: Batch 1 - Network Engineering 2026"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cdesc">Keterangan / Instansi</Label>
                    <Input
                      id="cdesc"
                      placeholder="Misal: Peserta Pelatihan ISP Internal"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
                <div className="p-4 bg-muted/30 border-t flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Menyimpan...' : 'Simpan Grup'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Form Edit Cohort */}
          {editingCohort && (
            <Card className="border-amber-500/40 bg-amber-500/5 shadow-md animate-in fade-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Edit Cohort #{editingCohort.id}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setEditingCohort(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <form onSubmit={handleUpdateCohort}>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="edit-cname">Nama Grup / Angkatan</Label>
                    <Input
                      id="edit-cname"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="edit-cdesc">Keterangan / Instansi</Label>
                    <Input
                      id="edit-cdesc"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
                <div className="p-4 bg-muted/30 border-t flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setEditingCohort(null)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Memperbarui...' : 'Simpan Perubahan'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Daftar Cohort */}
          <Card className="border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle className="text-base font-bold">Daftar Grup Terdaftar ({cohorts.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Memuat data cohort...</div>
              ) : cohorts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Belum ada grup cohort terdaftar. Klik "Buat Cohort Baru" untuk memulai.
                </div>
              ) : (
                <div className="divide-y">
                  {cohorts.map((c) => (
                    <div
                      key={c.id}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="h-11 w-11 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                          <Layers className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-foreground">{c.name}</h4>
                            <span className="text-xs text-muted-foreground font-mono">#{c.id}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{c.description || 'Tidak ada deskripsi'}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <Badge variant="secondary" className="font-mono text-xs gap-1">
                              <Users2 className="h-3 w-3" /> {c.member_count} Anggota
                            </Badge>
                            <Badge variant="outline" className="font-mono text-xs gap-1">
                              <BookOpen className="h-3 w-3 text-blue-500" /> {c.assignment_count} Modul Ditugaskan
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950"
                          onClick={() => openMembersModal(c)}
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Kelola Anggota
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950"
                          onClick={() => openAssignmentsModal(c)}
                        >
                          <BookOpen className="h-3.5 w-3.5" /> Penugasan Modul
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setEditingCohort(c)
                            setEditName(c.name)
                            setEditDescription(c.description || '')
                          }}
                          title="Edit Nama/Deskripsi"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteCohort(c.id, c.name)}
                          title="Hapus Cohort"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ─── MODAL KELOLA ANGGOTA ──────────────────────────────────────────────── */}
          {activeCohortForMembers && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border-primary/30">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users2 className="h-5 w-5 text-purple-600" />
                      Anggota Cohort: {activeCohortForMembers.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Total {members.length} peserta terdaftar di cohort ini.
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveCohortForMembers(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Bagian Tambah Anggota */}
                  <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <UserPlus className="h-3.5 w-3.5 text-primary" /> Tambah Peserta ke Cohort
                    </h5>
                    <div className="relative">
                      <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        placeholder="Cari user berdasarkan nama, email, atau instansi..."
                        className="pl-8 text-xs"
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                      />
                    </div>

                    {memberSearchQuery.trim() && (
                      <div className="max-h-40 overflow-y-auto divide-y border rounded-lg bg-background">
                        {availableUsers.length === 0 ? (
                          <div className="p-3 text-center text-xs text-muted-foreground">
                            Tidak ada peserta yang cocok atau semua sudah menjadi anggota.
                          </div>
                        ) : (
                          availableUsers.slice(0, 10).map((u) => {
                            const isSelected = selectedUserIds.includes(u.id)
                            return (
                              <div
                                key={u.id}
                                className={`p-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-muted/40 ${
                                  isSelected ? 'bg-primary/10' : ''
                                }`}
                                onClick={() => {
                                  setSelectedUserIds((prev) =>
                                    isSelected ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                                  )
                                }}
                              >
                                <div>
                                  <div className="font-semibold text-foreground">{u.full_name}</div>
                                  <div className="text-muted-foreground">{u.email} {u.institution ? `• ${u.institution}` : ''}</div>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="rounded border-gray-300"
                                />
                              </div>
                            )
                          })
                        )}
                      </div>
                    )}

                    {selectedUserIds.length > 0 && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-primary font-medium">
                          {selectedUserIds.length} peserta dipilih
                        </span>
                        <Button size="sm" onClick={handleAddMembers} disabled={submitting} className="text-xs">
                          {submitting ? 'Menambahkan...' : `Tambahkan (${selectedUserIds.length})`}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Daftar Anggota Saat Ini */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Daftar Anggota Aktif ({members.length})
                    </h5>
                    {loadingMembers ? (
                      <div className="p-6 text-center text-xs text-muted-foreground">Memuat anggota...</div>
                    ) : members.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted-foreground border rounded-xl border-dashed">
                        Belum ada anggota di cohort ini. Gunakan kolom pencarian di atas untuk menambahkan peserta.
                      </div>
                    ) : (
                      <div className="divide-y border rounded-xl overflow-hidden">
                        {members.map((m) => (
                          <div key={m.id} className="p-3 flex items-center justify-between text-xs hover:bg-muted/20">
                            <div>
                              <div className="font-semibold text-foreground">{m.full_name}</div>
                              <div className="text-muted-foreground">
                                {m.email} {m.phone_number ? `• ${m.phone_number}` : ''} {m.institution ? `• ${m.institution}` : ''}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveMember(m.user_id, m.full_name)}
                            >
                              Keluarkan
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-muted/20 border-t flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setActiveCohortForMembers(null)}>
                    Tutup
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* ─── MODAL PENUGASAN MODUL ─────────────────────────────────────────── */}
          {activeCohortForAssignments && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border-blue-500/30">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      Penugasan Modul: {activeCohortForAssignments.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tugaskan modul pembelajaran wajib beserta batas waktu penyelesaian.
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveCohortForAssignments(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Form Tugaskan Modul Baru */}
                  <form onSubmit={handleAssignModule} className="p-4 rounded-xl border bg-muted/20 space-y-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5 text-blue-600" /> Tugaskan Modul Baru
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="assign-mod" className="text-xs">Pilih Modul Pembelajaran</Label>
                        <select
                          id="assign-mod"
                          value={selectedModuleId}
                          onChange={(e) => setSelectedModuleId(e.target.value ? Number(e.target.value) : '')}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          required
                        >
                          <option value="">-- Pilih Modul --</option>
                          {allModules.map((mod) => (
                            <option key={mod.id} value={mod.id}>
                              {mod.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="assign-due" className="text-xs">Tenggat Waktu / Deadline (Opsional)</Label>
                        <Input
                          id="assign-due"
                          type="datetime-local"
                          className="text-xs h-9"
                          value={assignmentDueDate}
                          onChange={(e) => setAssignmentDueDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <Button type="submit" size="sm" disabled={submitting || !selectedModuleId} className="text-xs gap-1">
                        <Plus className="h-3.5 w-3.5" /> {submitting ? 'Menugaskan...' : 'Tugaskan Modul'}
                      </Button>
                    </div>
                  </form>

                  {/* Daftar Modul Ditugaskan */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Modul yang Sedang Ditugaskan ({assignments.length})
                    </h5>
                    {loadingAssignments ? (
                      <div className="p-6 text-center text-xs text-muted-foreground">Memuat penugasan...</div>
                    ) : assignments.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted-foreground border rounded-xl border-dashed">
                        Belum ada modul yang ditugaskan ke cohort ini.
                      </div>
                    ) : (
                      <div className="divide-y border rounded-xl overflow-hidden">
                        {assignments.map((a) => (
                          <div key={a.id} className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-muted/20">
                            <div className="space-y-1">
                              <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-blue-500" />
                                {a.module_title}
                              </div>
                              <div className="flex items-center gap-3 text-muted-foreground">
                                {a.due_date ? (
                                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                                    <Clock className="h-3 w-3" />
                                    Tenggat: {new Date(a.due_date).toLocaleDateString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">Tanpa batas waktu</span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveAssignment(a.id)}
                            >
                              Batalkan
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-muted/20 border-t flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setActiveCohortForAssignments(null)}>
                    Tutup
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

