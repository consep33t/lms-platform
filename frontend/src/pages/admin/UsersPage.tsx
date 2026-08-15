import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Users,
  Mail,
  Shield,
  UserCheck,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  Phone,
  Search,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import api from '@/lib/api'

interface AdminUserItem {
  id: number
  email: string
  personal_email?: string
  custom_lms_email?: string
  full_name: string
  role: string
  is_active: boolean
  is_approved: boolean
  approval_status: string
  registration_source: string
  phone_number?: string
  institution?: string
  rejection_reason?: string
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<AdminUserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending')
  const [searchQuery, setSearchQuery] = useState('')

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [submitting, setSubmitting] = useState(false)

  // Reject Modal
  const [rejectUserId, setRejectUserId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('Data pendaftaran tidak memenuhi kriteria verifikasi.')
  const [rejecting, setRejecting] = useState(false)

  useEffect(() => {
    fetchAllUserData()
  }, [])

  const fetchAllUserData = async () => {
    try {
      setLoading(true)
      const [resUsers, resPending] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/users/pending-approvals')
      ])
      setUsers(resUsers.data)
      setPendingApprovals(resPending.data)
      if (resPending.data.length > 0 && activeTab === 'all') {
        // default to pending if exists
      }
    } catch (err) {
      console.error('Failed to fetch users', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId: number) => {
    try {
      await api.post(`/admin/users/${userId}/approve`)
      alert('Pendaftaran peserta berhasil disetujui! Akun sekarang aktif dan dapat login.')
      fetchAllUserData()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal menyetujui pendaftaran.')
    }
  }

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectUserId) return

    try {
      setRejecting(true)
      await api.post(`/admin/users/${rejectUserId}/reject`, {
        rejection_reason: rejectReason
      })
      alert('Pendaftaran peserta telah ditolak.')
      setRejectUserId(null)
      fetchAllUserData()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal menolak pendaftaran.')
    } finally {
      setRejecting(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return

    try {
      setSubmitting(true)
      await api.post('/admin/users', {
        email,
        full_name: fullName,
        password,
        role,
      })
      setFullName('')
      setEmail('')
      setPassword('')
      setShowCreateModal(false)
      fetchAllUserData()
      alert('Pengguna baru berhasil ditambahkan!')
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal menambahkan user baru.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (userId: number) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`)
      fetchAllUserData()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal mengubah status user.')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Hapus akun user ini dari sistem?')) return
    try {
      await api.delete(`/admin/users/${userId}`)
      fetchAllUserData()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal menghapus user.')
    }
  }

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase()
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.custom_lms_email?.toLowerCase().includes(q) ||
      u.personal_email?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                <Users className="h-7 w-7 text-primary" /> Manajemen Pengguna & Persetujuan
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Verifikasi pendaftaran peserta baru, generate email LMS, dan kelola akun pengguna.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchAllUserData} className="gap-1.5 shadow-sm">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
              <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-1.5 shadow-md">
                <Plus className="h-4 w-4" /> Tambah User Langsung
              </Button>
            </div>
          </div>

          {/* Quick Stats / Navigation Tabs */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant={activeTab === 'pending' ? 'default' : 'outline'}
              onClick={() => setActiveTab('pending')}
              className={`gap-2 font-semibold ${activeTab === 'pending' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}`}
            >
              <Clock className="h-4 w-4" /> Menunggu Persetujuan
              {pendingApprovals.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-white text-amber-700 font-bold">
                  {pendingApprovals.length}
                </span>
              )}
            </Button>
            <Button
              variant={activeTab === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveTab('all')}
              className="gap-2 font-semibold"
            >
              <UserCheck className="h-4 w-4" /> Seluruh Pengguna Terdaftar ({users.length})
            </Button>
          </div>

          {/* TAB 1: PENDING APPROVALS */}
          {activeTab === 'pending' && (
            <Card className="border-amber-500/30 shadow-md">
              <CardHeader className="bg-amber-500/5 border-b border-amber-500/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" /> Permintaan Pendaftaran Peserta Baru
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Peserta di bawah ini telah mendaftar mandiri / via Google dan membutuhkan persetujuan Admin sebelum dapat masuk ke LMS.
                  </p>
                </div>
                <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/40">
                  {pendingApprovals.length} Menunggu
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">Memuat data verifikasi...</div>
                ) : pendingApprovals.length === 0 ? (
                  <div className="p-12 text-center space-y-2">
                    <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                    <p className="font-semibold text-foreground">Tidak ada pendaftaran yang tertunda!</p>
                    <p className="text-xs text-muted-foreground">Semua permohonan akun telah diproses.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {pendingApprovals.map((p) => (
                      <div key={p.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-base text-foreground">{p.full_name}</span>
                            <Badge variant="outline" className="text-xs border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/40">
                              Status: Menunggu Persetujuan
                            </Badge>
                            <Badge variant="secondary" className="text-xs uppercase">
                              Sumber: {p.registration_source}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground pt-1">
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              <span>Email Pribadi: <strong>{p.personal_email || p.email}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-primary" />
                              <span>Email LMS Kustom: <strong className="text-primary font-mono">{p.custom_lms_email || '-'}</strong></span>
                            </div>
                            {p.institution && (
                              <div className="flex items-center gap-1.5">
                                <Building className="h-3.5 w-3.5 text-slate-400" />
                                <span>Institusi: {p.institution}</span>
                              </div>
                            )}
                            {p.phone_number && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                <span>WhatsApp / HP: {p.phone_number}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span>Tanggal Daftar: {new Date(p.created_at).toLocaleString('id-ID')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 self-end md:self-center">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(p.id)}
                            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                          >
                            <CheckCircle className="h-4 w-4" /> Setujui & Aktifkan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectUserId(p.id)}
                            className="gap-1.5 border-rose-500/50 text-rose-500 hover:bg-rose-500/10"
                          >
                            <XCircle className="h-4 w-4" /> Tolak
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 2: ALL REGISTERED USERS */}
          {activeTab === 'all' && (
            <Card className="border-border/80 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/20 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base font-bold">Daftar Seluruh Pengguna ({users.length})</CardTitle>
                <div className="relative w-full sm:w-72">
                  <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama atau email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">Memuat data pengguna...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">Pengguna tidak ditemukan.</div>
                ) : (
                  <div className="divide-y">
                    {filteredUsers.map((u) => (
                      <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-foreground">{u.full_name}</span>
                            <Badge variant={u.role === 'superadmin' ? 'destructive' : u.role === 'admin' ? 'default' : 'secondary'} className="text-[11px] capitalize">
                              {u.role}
                            </Badge>
                            <Badge variant={u.is_active ? 'outline' : 'secondary'} className={`text-[11px] ${u.is_active ? 'border-emerald-500 text-emerald-600' : 'text-muted-foreground'}`}>
                              {u.is_active ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                            {u.approval_status === 'pending' && (
                              <Badge variant="outline" className="text-[11px] border-amber-500 text-amber-600">
                                Pending
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-0.5 font-mono">
                            <div>Email: {u.email}</div>
                            {u.custom_lms_email && <div className="text-primary">LMS Email: {u.custom_lms_email}</div>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {u.approval_status === 'pending' && (
                            <Button size="sm" onClick={() => handleApprove(u.id)} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 gap-1">
                              <CheckCircle className="h-3.5 w-3.5" /> Setujui
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(u.id)}
                            className="h-8 text-xs gap-1"
                          >
                            {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(u.id)}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
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
          )}

          {/* MODAL TAMBAH USER LANGSUNG OLEH ADMIN */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <Card className="w-full max-w-lg border-primary/40 shadow-2xl bg-card">
                <CardHeader className="border-b p-4 sm:p-6">
                  <CardTitle className="text-lg font-bold">Tambah Pengguna Baru (Langsung Aktif)</CardTitle>
                </CardHeader>
                <form onSubmit={handleCreateUser}>
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="ufull">Nama Lengkap</Label>
                      <Input id="ufull" placeholder="Misal: Ahmad Fauzi" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="uemail">Email</Label>
                      <Input id="uemail" type="email" placeholder="user@lms.alfanet.id" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="upass">Password</Label>
                      <Input id="upass" type="password" placeholder="Password kuat..." value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="urole">Role / Hak Akses</Label>
                      <select id="urole" className="w-full h-10 px-3 rounded-md border bg-background text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="user">Student (Peserta)</option>
                        <option value="instructor">Instructor (Pengajar)</option>
                        <option value="admin">Admin (Administrator)</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>Batal</Button>
                      <Button type="submit" size="sm" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan User'}</Button>
                    </div>
                  </CardContent>
                </form>
              </Card>
            </div>
          )}

          {/* MODAL TOLAK PENDAFTARAN */}
          {rejectUserId && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <Card className="w-full max-w-md border-rose-500/50 shadow-2xl bg-card">
                <CardHeader className="border-b p-4">
                  <CardTitle className="text-base font-bold text-rose-500 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" /> Konfirmasi Penolakan Pendaftaran
                  </CardTitle>
                </CardHeader>
                <form onSubmit={handleReject}>
                  <CardContent className="p-4 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Tuliskan alasan penolakan agar peserta mengetahui alasan akunnya tidak disetujui:
                    </p>
                    <textarea
                      rows={4}
                      className="w-full p-3 text-xs rounded-md border bg-background"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      required
                    />
                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button type="button" variant="outline" size="sm" onClick={() => setRejectUserId(null)}>Batal</Button>
                      <Button type="submit" size="sm" variant="destructive" disabled={rejecting}>
                        {rejecting ? 'Memproses...' : 'Tolak Pendaftaran'}
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
