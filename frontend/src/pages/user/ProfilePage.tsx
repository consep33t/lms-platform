import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Mail,
  Shield,
  Calendar,
  Award,
  Phone,
  Building2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Save,
} from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface UserProfile {
  id: number
  email: string
  full_name: string
  role: string
  phone_number?: string | null
  institution?: string | null
  created_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  // Edit profile state
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [institution, setInstitution] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // Toast / Alert notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3500)
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await api.get('/auth/me')
      const data = res.data
      setProfile(data)
      setFullName(data.full_name || '')
      setPhoneNumber(data.phone_number || '')
      setInstitution(data.institution || '')
    } catch (err) {
      console.error('Failed to fetch profile', err)
      showToast('Gagal memuat data profil.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      showToast('Nama lengkap tidak boleh kosong.', 'error')
      return
    }

    try {
      setSavingProfile(true)
      const res = await api.put('/users/me', {
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim() || null,
        institution: institution.trim() || null,
      })

      const updated = res.data
      setProfile(updated)

      // Sync updated name with Zustand store
      const { user, accessToken, setAuth } = useAuthStore.getState()
      if (user && accessToken) {
        setAuth({ ...user, full_name: updated.full_name }, accessToken)
      }

      showToast('Profil berhasil diperbarui!')
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Gagal menyimpan perubahan profil.'
      showToast(msg, 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      showToast('Masukkan password saat ini.', 'error')
      return
    }
    if (newPassword.length < 8) {
      showToast('Password baru minimal 8 karakter.', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('Konfirmasi password tidak cocok dengan password baru.', 'error')
      return
    }

    try {
      setChangingPassword(true)
      await api.put('/users/me/password', {
        current_password: currentPassword,
        new_password: newPassword,
      })

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showToast('Password berhasil diubah!')
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Gagal mengubah password.'
      showToast(msg, 'error')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-3xl mx-auto py-12 text-center text-muted-foreground text-sm">
          Memuat profil pengguna...
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Notification Toast */}
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

        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profil & Pengaturan Akun</h1>
          <p className="text-muted-foreground text-sm">
            Kelola data diri, kontak, instansi, serta keamanan kata sandi akun Anda.
          </p>
        </div>

        {/* Profile Card Header */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl shadow-inner">
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl">{profile?.full_name}</CardTitle>
              <CardDescription className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="capitalize text-xs">
                  {profile?.role} User
                </Badge>
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Akun Terverifikasi
                </span>
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs Navigation */}
        <div className="flex border-b border-border/80 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="h-4 w-4" /> Informasi Akun & Data Diri
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'password'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <KeyRound className="h-4 w-4" /> Keamanan & Password
          </button>
        </div>

        {/* TAB 1: DATA DIRI & INFORMASI */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Form Edit */}
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="bg-muted/20 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Edit Data Diri
                </CardTitle>
                <CardDescription className="text-xs">
                  Informasi ini digunakan untuk pencetakan nama pada sertifikat kelulusan.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fname" className="text-xs font-semibold">
                      Nama Lengkap (Sesuai KTP / Ijazah)
                    </Label>
                    <Input
                      id="fname"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fphone" className="text-xs font-semibold flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Nomor WhatsApp / HP
                      </Label>
                      <Input
                        id="fphone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Contoh: 081234567890"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="finst" className="text-xs font-semibold flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> Instansi / Perusahaan / Kampus
                      </Label>
                      <Input
                        id="finst"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="Contoh: PT Telekomunikasi / Universitas X"
                      />
                    </div>
                  </div>
                </CardContent>

                <div className="p-4 bg-muted/20 border-t flex justify-end">
                  <Button type="submit" disabled={savingProfile} className="gap-1.5 shadow">
                    <Save className="h-4 w-4" />
                    {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Read-only Stats & Info */}
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="bg-muted/20 border-b">
                <CardTitle className="text-base font-bold">Ringkasan Akun</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3.5 rounded-xl border bg-muted/20 space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase">
                      <Mail className="h-3.5 w-3.5 text-primary" /> Alamat Email Terdaftar
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
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })
                        : '-'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border bg-muted/20 space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase">
                      <Award className="h-3.5 w-3.5 text-amber-500" /> Status Pelatihan
                    </div>
                    <div className="font-semibold text-foreground text-emerald-600">Aktif Mengikuti Modul</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: KEAMANAN & GANTI PASSWORD */}
        {activeTab === 'password' && (
          <Card className="border-border/80 shadow-sm animate-in fade-in">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-600" /> Ganti Kata Sandi (Password)
              </CardTitle>
              <CardDescription className="text-xs">
                Pastikan kata sandi baru Anda memiliki panjang minimal 8 karakter.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleChangePassword}>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cur-pass" className="text-xs font-semibold">
                    Kata Sandi Saat Ini
                  </Label>
                  <Input
                    id="cur-pass"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan kata sandi saat ini"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-pass" className="text-xs font-semibold">
                      Kata Sandi Baru (Min. 8 karakter)
                    </Label>
                    <Input
                      id="new-pass"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Masukkan kata sandi baru"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="conf-pass" className="text-xs font-semibold">
                      Konfirmasi Kata Sandi Baru
                    </Label>
                    <Input
                      id="conf-pass"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang kata sandi baru"
                      required
                    />
                  </div>
                </div>

                {newPassword && (
                  <div className="text-xs flex items-center gap-2 pt-1">
                    <span className="text-muted-foreground">Panjang password:</span>
                    <span
                      className={`font-semibold ${
                        newPassword.length >= 8 ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {newPassword.length} karakter {newPassword.length >= 8 ? '(Memenuhi syarat)' : '(Kurang dari 8)'}
                    </span>
                  </div>
                )}
              </CardContent>

              <div className="p-4 bg-muted/20 border-t flex justify-end">
                <Button type="submit" disabled={changingPassword} className="gap-1.5 shadow">
                  <KeyRound className="h-4 w-4" />
                  {changingPassword ? 'Memproses...' : 'Perbarui Kata Sandi'}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </PageLayout>
  )
}

