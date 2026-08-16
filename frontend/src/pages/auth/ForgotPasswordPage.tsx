import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '@/components/templates/AuthLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/atoms/Card'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 800)
  }

  return (
    <AuthLayout>
      <Card className="w-full shadow-2xl border-border bg-card/95 backdrop-blur-md">
        <div className="h-1.5 bg-gradient-to-r from-primary to-indigo-500" />
        <CardHeader className="space-y-1 text-center pt-6">
          <CardTitle className="text-2xl font-black tracking-tight">Lupa Kata Sandi</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Masukkan email terdaftar Anda untuk menerima tautan pemulihan kata sandi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
              <p className="font-semibold">Instruksi pemulihan telah dikirim!</p>
              <p className="text-muted-foreground">
                Silakan periksa kotak masuk atau folder spam email <strong>{email}</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-foreground">
                  Alamat Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full h-10 font-bold text-xs" isLoading={loading}>
                Kirim Link Reset
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="pt-2 border-t border-border flex justify-center">
          <Link
            to="/login"
            className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Masuk</span>
          </Link>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
