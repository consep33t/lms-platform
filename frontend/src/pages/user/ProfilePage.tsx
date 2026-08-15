import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Shield, Calendar, BookOpen, Award } from 'lucide-react'
import api from '@/lib/api'

interface UserProfile {
  id: number
  email: string
  full_name: string
  role: string
  created_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await api.get('/auth/me')
      setProfile(res.data)
    } catch (err) {
      console.error('Failed to fetch profile', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-3xl mx-auto py-12 text-center text-muted-foreground">
          Memuat profil pengguna...
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profil Pengguna</h1>
          <p className="text-muted-foreground text-sm">Informasi akun peserta pembelajaran LMS.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-2xl">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl">{profile?.full_name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">{profile?.role}</Badge>
                <span>� Akun Terverifikasi</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3.5 rounded-xl border bg-muted/20 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase">
                  <Mail className="h-3.5 w-3.5 text-primary" /> Alamat Email
                </div>
                <div className="font-semibold text-foreground">{profile?.email}</div>
              </div>

              <div className="p-3.5 rounded-xl border bg-muted/20 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" /> Tingkat Hak Akses
                </div>
                <div className="font-semibold text-foreground capitalize">{profile?.role} User</div>
              </div>

              <div className="p-3.5 rounded-xl border bg-muted/20 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase">
                  <Calendar className="h-3.5 w-3.5 text-blue-500" /> Terdaftar Sejak
                </div>
                <div className="font-semibold text-foreground">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border bg-muted/20 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase">
                  <Award className="h-3.5 w-3.5 text-amber-500" /> Status Pelatihan
                </div>
                <div className="font-semibold text-foreground">Aktif Mengikuti Modul</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
