import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, RefreshCw, Shield, Mail } from 'lucide-react'
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

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/users')
      setUsers(res.data)
    } catch (err) {
      console.error('Failed to fetch admin users', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Manajemen Pengguna & Hak Akses</h1>
              <p className="text-muted-foreground text-sm">Daftar seluruh akun peserta dan staf administrator sistem.</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>

          <Card className="border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle className="text-base font-bold">Daftar Akun Pengguna ({users.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Memuat data pengguna...</div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Belum ada akun pengguna.</div>
              ) : (
                <div className="divide-y">
                  {users.map((u) => (
                    <div key={u.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {u.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground flex items-center gap-2">
                            {u.full_name}
                            <Badge variant={u.role === 'superadmin' ? 'default' : 'secondary'} className="capitalize text-xs">
                              {u.role}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {u.email}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500">
                        {u.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
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
