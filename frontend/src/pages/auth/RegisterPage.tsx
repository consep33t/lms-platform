import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  GraduationCap,
  Sparkles,
  Mail,
  Lock,
  User,
  Phone,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Globe
} from 'lucide-react'
import api from '@/lib/api'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [regMode, setRegMode] = useState<'manual' | 'google'>('manual')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [institution, setInstitution] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Success State
  const [registeredData, setRegisteredData] = useState<{
    full_name: string
    personal_email: string
    custom_lms_email: string
    approval_status: string
  } | null>(null)

  // Live preview candidate LMS email
  const calculatePreviewEmail = () => {
    if (!fullName.trim()) return 'peserta@student.lms.alfanet.id'
    const clean = fullName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
    const parts = clean.split(/\s+/).filter(Boolean)
    if (parts.length === 0) return 'peserta@student.lms.alfanet.id'
    if (parts.length === 1) return `${parts[0]}842@student.lms.alfanet.id`
    return `${parts[0]}.${parts[parts.length - 1]}842@student.lms.alfanet.id`
  }

  const handleManualRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok!')
      return
    }
    if (password.length < 6) {
      setError('Kata sandi minimal harus terdiri dari 6 karakter!')
      return
    }

    try {
      setLoading(true)
      const res = await api.post('/auth/register-student', {
        full_name: fullName,
        email,
        password,
        phone_number: phone || null,
        institution: institution || null,
      })

      setRegisteredData({
        full_name: res.data.full_name,
        personal_email: res.data.personal_email,
        custom_lms_email: res.data.custom_lms_email,
        approval_status: res.data.approval_status
      })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Pendaftaran gagal. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegisterSim = async () => {
    const googleName = prompt('Masukkan Nama Lengkap Anda (Akun Google):', fullName || 'Budi Santoso')
    if (!googleName) return
    const googleEmail = prompt('Masukkan Email Google Anda (@gmail.com):', email || 'budi.santoso@gmail.com')
    if (!googleEmail) return

    try {
      setLoading(true)
      setError(null)
      const res = await api.post('/auth/google-register', {
        full_name: googleName,
        email: googleEmail,
        institution: institution || 'Google Verified User'
      })

      if (res.data.status === 'approved') {
        alert('Akun Google Anda telah terverifikasi dan aktif. Mengarahkan ke dashboard...')
        navigate('/login')
      } else {
        setRegisteredData({
          full_name: res.data.user.full_name,
          personal_email: res.data.user.personal_email,
          custom_lms_email: res.data.user.custom_lms_email,
          approval_status: res.data.user.approval_status
        })
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal mendaftar dengan Google.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      {/* Header Brand */}
      <div className="text-center mb-6 space-y-2">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-primary">
            LMS Platform
          </span>
        </Link>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md">
          Portal Pendaftaran Peserta Baru Akademi Teknologi, Cloud & Software Engineering
        </p>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-xl">
        {registeredData ? (
          /* REGISTRATION SUCCESS CARD */
          <Card className="border-primary/50 shadow-2xl bg-slate-900/90 backdrop-blur-md text-slate-100 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-amber-500 via-primary to-emerald-500" />
            <CardHeader className="text-center pb-2 pt-6">
              <div className="h-14 w-14 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
                <Clock className="h-7 w-7 animate-pulse" />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight text-white">
                Pendaftaran Berhasil Diterima!
              </CardTitle>
              <CardDescription className="text-slate-300 text-xs sm:text-sm mt-1">
                Akun peserta Anda telah dibuat dan otomatis digenerate ID Email Resmi LMS.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {/* Custom LMS Generated Box */}
              <div className="p-4 rounded-xl border border-primary/40 bg-primary/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> Email Resmi LMS Peserta Anda:
                  </span>
                  <Badge variant="outline" className="border-primary text-primary text-[10px]">
                    Official Student ID
                  </Badge>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono font-bold text-sm sm:text-base text-primary tracking-wide select-all">
                  {registeredData.custom_lms_email}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Gunakan email resmi di atas atau email pribadi (<strong>{registeredData.personal_email}</strong>) untuk masuk ke LMS setelah disetujui.
                </p>
              </div>

              {/* Status Notice */}
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1 leading-relaxed">
                  <strong className="text-amber-300 block font-semibold">Menunggu Persetujuan Administrator</strong>
                  <p>
                    Akun Anda saat ini berstatus <strong>Pending Approval</strong>. Administrator akan melakukan verifikasi data pendaftaran Anda. Anda baru dapat melakukan login setelah akun disetujui.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-lg shadow-primary/25"
                >
                  Kembali ke Halaman Login <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* REGISTRATION FORM CARD */
          <Card className="border-slate-800 shadow-2xl bg-slate-900/90 backdrop-blur-md text-slate-100 overflow-hidden">
            {/* Header Tabs */}
            <div className="grid grid-cols-2 border-b border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setRegMode('manual')}
                className={`py-3.5 text-center transition-colors border-b-2 ${
                  regMode === 'manual'
                    ? 'border-primary text-primary bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                📝 Formulir Pendaftaran
              </button>
              <button
                type="button"
                onClick={() => setRegMode('google')}
                className={`py-3.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                  regMode === 'google'
                    ? 'border-primary text-primary bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Daftar via Google
              </button>
            </div>

            <CardContent className="p-6 space-y-4">
              {error && (
                <div className="p-3 text-xs rounded-xl bg-rose-500/10 text-rose-400 font-medium border border-rose-500/30">
                  {error}
                </div>
              )}

              {/* Google Mode */}
              {regMode === 'google' ? (
                <div className="py-6 text-center space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Daftar secara instan menggunakan akun Google Anda. Sistem akan memverifikasi identitas dan men-generate Email Resmi LMS Anda secara otomatis.
                    </p>
                    <Button
                      type="button"
                      onClick={handleGoogleRegisterSim}
                      disabled={loading}
                      className="w-full h-11 bg-white hover:bg-slate-100 text-slate-900 font-semibold gap-2 shadow"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      {loading ? 'Menghubungkan...' : 'Lanjutkan dengan Google SSO'}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Manual Mode */
                <form onSubmit={handleManualRegister} className="space-y-3.5">
                  <div className="space-y-1">
                    <Label htmlFor="regFullName" className="text-xs font-semibold text-slate-200">
                      Nama Lengkap Peserta
                    </Label>
                    <div className="relative">
                      <User className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                      <Input
                        id="regFullName"
                        placeholder="Misal: Ahmad Fauzi Pratama"
                        className="pl-9 bg-slate-950 border-slate-800 text-slate-100 text-xs h-10"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Realtime Email Preview */}
                  <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-between text-xs">
                    <span className="text-primary font-semibold flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Email Resmi LMS yang akan dibuat:
                    </span>
                    <span className="font-mono text-primary font-bold text-[11px] truncate max-w-[200px]">
                      {calculatePreviewEmail()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="regEmail" className="text-xs font-semibold text-slate-200">
                      Email Pribadi (Untuk Notifikasi & Login)
                    </Label>
                    <div className="relative">
                      <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                      <Input
                        id="regEmail"
                        type="email"
                        placeholder="nama.anda@gmail.com"
                        className="pl-9 bg-slate-950 border-slate-800 text-slate-100 text-xs h-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="regPhone" className="text-xs font-semibold text-slate-200">
                        Nomor WhatsApp / HP
                      </Label>
                      <div className="relative">
                        <Phone className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                        <Input
                          id="regPhone"
                          placeholder="081234567890"
                          className="pl-9 bg-slate-950 border-slate-800 text-slate-100 text-xs h-10"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="regInst" className="text-xs font-semibold text-slate-200">
                        Asal Kampus / Instansi
                      </Label>
                      <div className="relative">
                        <Building className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                        <Input
                          id="regInst"
                          placeholder="Universitas / Perusahaan"
                          className="pl-9 bg-slate-950 border-slate-800 text-slate-100 text-xs h-10"
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="regPass" className="text-xs font-semibold text-slate-200">
                        Kata Sandi (Password)
                      </Label>
                      <div className="relative">
                        <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                        <Input
                          id="regPass"
                          type="password"
                          placeholder="Minimal 6 karakter"
                          className="pl-9 bg-slate-950 border-slate-800 text-slate-100 text-xs h-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="regConfirm" className="text-xs font-semibold text-slate-200">
                        Konfirmasi Sandi
                      </Label>
                      <div className="relative">
                        <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                        <Input
                          id="regConfirm"
                          type="password"
                          placeholder="Ulangi kata sandi"
                          className="pl-9 bg-slate-950 border-slate-800 text-slate-100 text-xs h-10"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs gap-2 shadow-lg shadow-primary/25"
                    >
                      {loading ? 'Memproses Pendaftaran...' : 'Daftar Sebagai Peserta Baru'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>

            <CardFooter className="bg-slate-950/80 border-t border-slate-800/80 p-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <span>Sudah memiliki akun terdaftar?</span>
              <Link to="/login" className="text-primary font-bold hover:underline">
                Masuk ke Akun Anda →
              </Link>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
