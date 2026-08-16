import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Award,
  CheckCircle2,
  XCircle,
  Search,
  Building2,
  Calendar,
  BookOpen,
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react'
import api from '@/lib/api'

interface VerifyResult {
  is_valid: boolean
  certificate_code: string
  student_name: string
  module_title: string
  institution: string | null
  issued_at: string | null
  message: string
}

export default function VerifyPage() {
  const { code: routeCode } = useParams<{ code?: string }>()
  const [searchCode, setSearchCode] = useState(routeCode || '')
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (routeCode) {
      handleVerifyCode(routeCode)
    }
  }, [routeCode])

  const handleVerifyCode = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return

    try {
      setLoading(true)
      setHasSearched(true)
      const res = await api.get(`/certificates/verify/${codeToVerify.trim()}`)
      setResult(res.data)
    } catch (err) {
      setResult({
        is_valid: false,
        certificate_code: codeToVerify,
        student_name: '',
        module_title: '',
        institution: null,
        issued_at: null,
        message: 'Gagal menghubungi server verifikasi. Periksa kembali kode sertifikat Anda.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleVerifyCode(searchCode)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-lg shadow-sm">
            A
          </div>
          <div>
            <h2 className="font-bold text-sm leading-tight text-foreground">Alfanet LMS Verification</h2>
            <p className="text-[11px] text-muted-foreground">Portal Verifikasi Kredensial & Sertifikat Resmi</p>
          </div>
        </div>
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Beranda LMS
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-12 space-y-8 flex flex-col justify-center">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary mb-2">
            <ShieldCheck className="h-3.5 w-3.5" /> Verifikasi Digital Terpusat
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Verifikasi Keaslian Sertifikat
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Masukkan kode registrasi sertifikat resmi untuk memeriksa validitas dan data kompetensi peserta pelatihan.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl mx-auto w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Contoh: CERT-LMS-2026-A1B2C3D4"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="pl-10 h-11 text-sm bg-background shadow-sm"
              required
            />
          </div>
          <Button type="submit" disabled={loading || !searchCode.trim()} className="h-11 px-6 font-bold shadow-sm">
            {loading ? 'Memeriksa...' : 'Verifikasi'}
          </Button>
        </form>

        {/* Results Display */}
        {hasSearched && result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {result.is_valid ? (
              <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-xl overflow-hidden">
                <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/20 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                      <CheckCircle2 className="h-5 w-5" />
                      SERTIFIKAT SAH & TERVERIFIKASI
                    </div>
                    <Badge className="bg-emerald-600 text-white font-mono text-xs">
                      Status: Valid
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-extrabold pt-2 text-foreground">
                    {result.student_name}
                  </CardTitle>
                  {result.institution && (
                    <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" /> {result.institution}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl border bg-background/80 space-y-1">
                      <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                        <BookOpen className="h-3.5 w-3.5 text-primary" /> Modul Pelatihan
                      </span>
                      <div className="font-bold text-sm text-foreground">{result.module_title}</div>
                    </div>

                    <div className="p-3.5 rounded-xl border bg-background/80 space-y-1">
                      <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-blue-500" /> Tanggal Penerbitan
                      </span>
                      <div className="font-bold text-sm text-foreground">
                        {result.issued_at
                          ? new Date(result.issued_at).toLocaleDateString('id-ID', { dateStyle: 'long' })
                          : '-'}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border bg-background/80 space-y-1 sm:col-span-2">
                      <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Award className="h-3.5 w-3.5 text-amber-500" /> Nomor Registrasi Resmi
                      </span>
                      <div className="font-mono font-bold text-xs text-primary">{result.certificate_code}</div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground text-center pt-2">
                    {result.message}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-destructive/30 bg-destructive/5 shadow-xl text-center p-8 space-y-3">
                <XCircle className="h-12 w-12 text-destructive mx-auto" />
                <h3 className="text-lg font-bold text-destructive">Sertifikat Tidak Ditemukan</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {result.message}
                </p>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 px-6 text-center text-xs text-muted-foreground bg-background">
        <p>&copy; 2026 PT Alfanet Mediatama. Hak Cipta Dilindungi.</p>
      </footer>
    </div>
  )
}
