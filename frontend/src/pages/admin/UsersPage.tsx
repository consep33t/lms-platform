import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Mail, Shield, UserCheck, RefreshCw, Plus, Trash2, Edit2, Power } from 'lucide-react'
import api from '@/lib/api'

interface AdminUserItem {
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/users')
      setUsers(res.data)
    } catch (err) {
      console.error('Failed to fetch users', err)
    } finally {
      setLoading(false)
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
      fetchUsers()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal menambahkan user baru.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (userId: number) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`)
      fetchUsers()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal mengubah status user.')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Hapus akun user ini dari sistem?')) return
    try {
      await api.delete(`/admin/users/${userId}`)
      fetchUsers()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Gagal menghapus user.')
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
              <h1 className="text-2xl font-bold tracking-tight">Manajemen Pengguna & Peserta</h1>
              <p className="text-muted-foreground text-sm">Kelola akun peserta, instruktur, hak akses role, dan status keaktifan akun.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
              <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-1.5 shadow">
                <Plus className="h-4 w-4" /> Tambah User Baru
              </Button>
            </div>
          </div>

          {/* Form Modal Tambah User */}
          {showCreateModal && (
            <Card className="border-primary/40 bg-muted/20 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Tambah Pengguna Baru</CardTitle>
              </CardHeader>
              <form onSubmit={handleCreateUser}>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <option value="student">Student (Peserta)</option>
                      <option value="instructor">Instructor (Pengajar)</option>
                      <option value="admin">Admin (Administrator)</option>
                    </select>
                  </div>
                </CardContent>
                <div className="p-4 bg-muted/30 border-t flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Batal</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan User'}</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Tabel Pengguna */}
          <Card className="border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle className="text-base font-bold">Daftar Pengguna Terdaftar ({users.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Memuat data pengguna...</div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Belum ada pengguna.</div>
              ) : (
                <div className="divide-y">
                  {users.map((u) => (
                    <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                          {u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground flex items-center gap-2">
                            {u.full_name}
                            <Badge variant={u.role === 'admin' ? 'destructive' : u.role === 'instructor' ? 'secondary' : 'outline'} className="text-xs">
                              {u.role}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {u.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => handleToggleStatus(u.id)} className="gap-1.5 text-xs">
                          <Power className={`h-3.5 w-3.5 ${u.is_active ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                          {u.is_active ? 'Aktif' : 'Nonaktif'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
