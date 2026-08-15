import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { GraduationCap, Mail, Lock, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react'
import api from '@/lib/api'
import { useNavigate, Link } from 'react-router-dom'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const resp = await api.post('/auth/login', { email: email.trim(), password })
      setAuth(resp.data.user, resp.data.access_token)
      if (resp.data.user.role === 'admin' || resp.data.user.role === 'superadmin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal masuk. Periksa email & kata sandi Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-slate-800 bg-slate-900/90 backdrop-blur-md text-slate-100 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary via-indigo-500 to-emerald-500" />
      <CardHeader className="space-y-2 text-center pt-6">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/30 mx-auto mb-1">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-black tracking-tight text-white">
          Masuk ke Portal LMS
        </CardTitle>
        <CardDescription className="text-slate-400 text-xs">
          Gunakan <strong>Email Resmi LMS</strong> atau <strong>Email Pribadi</strong> terdaftar Anda.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-2">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-amber-500/10 text-amber-300 font-medium border border-amber-500/30 flex items-start gap-2 leading-relaxed">
              <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="loginEmail" className="text-xs font-semibold text-slate-200">
              Email LMS / Email Pribadi
            </Label>
            <div className="relative">
              <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <Input
                id="loginEmail"
                type="text"
                placeholder="nama@student.lms.alfanet.id / user@gmail.com"
                className="pl-9 bg-slate-950 border-slate-800 text-slate-100 text-xs h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="loginPass" className="text-xs font-semibold text-slate-200">
                Kata Sandi (Password)
              </Label>
              <Link to="/forgot-password" className="text-[11px] text-primary hover:underline">
                Lupa sandi?
              </Link>
            </div>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <Input
                id="loginPass"
                type="password"
                placeholder="••••••••"
                className="pl-9 bg-slate-950 border-slate-800 text-slate-100 text-xs h-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-6">
          <Button
            type="submit"
            className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-bold text-xs gap-2 shadow-lg shadow-primary/25"
            disabled={loading}
          >
            {loading ? 'Memverifikasi Akun...' : 'Masuk ke Platform'}
          </Button>

          <div className="pt-2 border-t border-slate-800/80 w-full text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <span>Belum memiliki akun peserta?</span>
            <Link to="/register" className="text-primary font-bold hover:underline inline-flex items-center gap-1">
              Daftar Sekarang <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
