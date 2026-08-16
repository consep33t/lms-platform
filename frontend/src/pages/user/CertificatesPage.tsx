import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Award, Download, ExternalLink, Calendar, BookOpen, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '@/lib/api'

interface CertificateItem {
  id: number
  certificate_code: string
  module_id: number
  module_title: string
  user_id: number
  user_name: string
  issued_at: string
  download_url: string
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const res = await api.get('/certificates/my')
      setCertificates(res.data)
    } catch (err) {
      console.error('Failed to fetch certificates', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (certId: number, certCode: string) => {
    try {
      const res = await api.get(`/certificates/${certId}/download`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Sertifikat_${certCode}.svg`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Gagal mengunduh sertifikat.')
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-16 text-center text-muted-foreground text-sm">
          Memuat sertifikat kelulusan...
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sertifikat & Kredensial Saya</h1>
            <p className="text-muted-foreground text-sm">
              Koleksi sertifikat kelulusan resmi Anda yang dapat diunduh dan diverifikasi secara online.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchCertificates} className="gap-1.5 self-start sm:self-center">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>

        {certificates.length === 0 ? (
          <Card className="p-12 text-center border-dashed space-y-3">
            <Award className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
            <h3 className="font-bold text-base text-foreground">Belum Ada Sertifikat Diterbitkan</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Selesaikan seluruh materi sesi dan evaluasi kuis pada modul dengan skor di atas KKM untuk mendapatkan sertifikat resmi.
            </p>
            <Link to="/">
              <Button size="sm" className="mt-2">
                Lihat Katalog Modul
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((c) => (
              <Card key={c.id} className="border-border/80 hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between">
                <CardHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b pb-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-mono text-[11px] gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Terverifikasi
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      #{c.certificate_code}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground line-clamp-2 pt-2">
                    {c.module_title}
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                    Diterbitkan: {new Date(c.issued_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <div className="p-3 rounded-lg bg-muted/20 border text-xs space-y-1">
                    <span className="text-muted-foreground font-medium">Penerima Sertifikat:</span>
                    <div className="font-bold text-foreground">{c.user_name}</div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 text-xs shadow-sm"
                      onClick={() => handleDownload(c.id, c.certificate_code)}
                    >
                      <Download className="h-3.5 w-3.5" /> Unduh Sertifikat
                    </Button>
                    <Link to={`/verify/${c.certificate_code}`} target="_blank">
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs" title="Buka Halaman Verifikasi">
                        <ExternalLink className="h-3.5 w-3.5" /> Verifikasi
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
