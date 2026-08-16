import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3, RefreshCw, BookOpen, CheckCircle, Users, Download, FileSpreadsheet } from 'lucide-react'
import api from '@/lib/api'

interface CompletionReportItem {
  module_id: number
  module_title: string
  total_enrolled: number
  total_completed: number
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<CompletionReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/reports/module-completion')
      setReports(res.data)
    } catch (err) {
      console.error('Failed to fetch reports', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (type: 'modules' | 'users') => {
    try {
      setIsExporting(true)
      const endpoint = type === 'modules' ? '/admin/reports/export/module-completion' : '/admin/reports/export/users'
      const filename = type === 'modules' ? 'Laporan_Kelulusan_Modul.csv' : 'Laporan_Pengguna_LMS.csv'
      const res = await api.get(endpoint, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Gagal mengunduh laporan CSV.')
    } finally {
      setIsExporting(false)
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
              <h1 className="text-2xl font-bold tracking-tight">Laporan & Analitik Kelulusan Modul</h1>
              <p className="text-muted-foreground text-sm">Tinjau rasio peserta yang mendaftar dan berhasil lulus per modul pembelajaran.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('modules')}
                disabled={isExporting}
                className="gap-1.5"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Export Modul (.CSV)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('users')}
                disabled={isExporting}
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5 text-primary" /> Export User (.CSV)
              </Button>
              <Button variant="outline" size="sm" onClick={fetchReports} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
            </div>
          </div>


          <Card className="border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Rasio Kelulusan Peserta Per Modul
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Memuat laporan...</div>
              ) : reports.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Belum ada data modul terdaftar.</div>
              ) : (
                <div className="divide-y">
                  {reports.map((r) => {
                    const rate = r.total_enrolled > 0 ? Math.round((r.total_completed / r.total_enrolled) * 100) : 0

                    return (
                      <div key={r.module_id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30">
                        <div className="space-y-1">
                          <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-primary" /> {r.module_title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Terdaftar: <strong>{r.total_enrolled}</strong> Peserta � Lulus: <strong>{r.total_completed}</strong> Peserta
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-bold text-foreground">{rate}% Lulus</div>
                            <p className="text-[11px] text-muted-foreground">Tingkat Kelulusan</p>
                          </div>
                          <Badge variant={rate > 50 ? 'default' : 'secondary'} className={rate > 50 ? 'bg-emerald-600' : ''}>
                            {rate}%
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
