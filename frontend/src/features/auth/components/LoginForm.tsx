import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/atoms/Card'
import { GraduationCap, Mail, Lock, ArrowRight, ShieldAlert, KeyRound } from 'lucide-react'
import api from '@/lib/api'

interface SSOProviderItem {
  id: number
  name: string
  type: string
  is_active: boolean
}

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ssoProviders, setSsoProviders] = useState<SSOProviderItem[]>([])
  const [ssoLoading, setSsoLoading] = useState(false)

  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if tenant has active SSO providers
    api
      .get<SSOProviderItem[]>('/sso/providers')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setSsoProviders(res.data.filter((p) => p.is_active))
        }
      })
      .catch(() => {
        // Silently ignore if no SSO configured or tenant is default
      })
  }, [])

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
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        setError(detail)
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg || JSON.stringify(d)).join(', '))
      } else {
        setError('Gagal masuk. Periksa email & kata sandi Anda atau status koneksi server.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSSOLogin = async (providerId: number) => {
    setSsoLoading(true)
    setError(null)
    try {
      const res = await api.get<{ auth_url: string }>(`/sso/login/${providerId}`)
      if (res.data?.auth_url) {
        window.location.href = res.data.auth_url
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal memulai autentikasi SSO Korporat.')
      setSsoLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-2xl border-border bg-card/95 backdrop-blur-md text-card-foreground overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary via-indigo-500 to-emerald-500" />
      <CardHeader className="space-y-2 text-center pt-6">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-lg shadow-primary/20 mx-auto mb-1">
          <GraduationCap className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-black tracking-tight">
          Masuk ke Portal LMS
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          Gunakan <strong>Email Resmi LMS</strong> atau <strong>Email Pribadi</strong> terdaftar Anda.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-2">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-destructive/10 text-destructive font-medium border border-destructive/20 flex items-start gap-2 leading-relaxed">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="loginEmail" className="text-xs font-semibold text-foreground">
              Email LMS / Email Pribadi
            </label>
            <Input
              id="loginEmail"
              type="text"
              placeholder="nama@student.lms.alfanet.id / user@gmail.com"
              leftIcon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="loginPass" className="text-xs font-semibold text-foreground">
                Kata Sandi (Password)
              </label>
              <Link to="/forgot-password" className="text-[11px] text-primary hover:underline">
                Lupa sandi?
              </Link>
            </div>
            <Input
              id="loginPass"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-6">
          <Button
            type="submit"
            className="w-full h-10 font-bold text-xs gap-2 shadow-lg shadow-primary/25"
            disabled={loading || ssoLoading}
            isLoading={loading}
          >
            Masuk ke Platform
          </Button>

          {/* Corporate SSO Login Options */}
          {ssoProviders.length > 0 && (
            <div className="w-full space-y-2 pt-2 border-t border-border">
              {ssoProviders.map((provider) => (
                <Button
                  key={provider.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-xs"
                  onClick={() => handleSSOLogin(provider.id)}
                  disabled={loading || ssoLoading}
                  leftIcon={<KeyRound className="w-3.5 h-3.5 text-primary" />}
                >
                  Login dengan {provider.name} ({provider.type.toUpperCase()})
                </Button>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-border w-full text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
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
