import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Users2, Plus, RefreshCw, Layers } from 'lucide-react'
import api from '@/lib/api'

interface CohortItem {
  id: number
  name: string
  description: string | null
  member_count: number
}

export default function AdminCohortsPage() {
  const [cohorts, setCohorts] = useState<CohortItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCohorts()
  }, [])

  const fetchCohorts = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/cohorts')
      setCohorts(res.data)
    } catch (err) {
      console.error('Failed to fetch cohorts', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      setSubmitting(true)
      await api.post('/admin/cohorts', { name, description })
      setName('')
      setDescription('')
      setShowModal(false)
      fetchCohorts()
    } catch (err) {
      alert('Gagal membuat grup cohort.')
    } finally {
      setSubmitting(false)
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
              <h1 className="text-2xl font-bold tracking-tight">Manajemen Grup & Cohort Peserta</h1>
              <p className="text-muted-foreground text-sm">Kelompokkan peserta berdasarkan angkatan, instansi, atau divisi.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchCohorts} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
              <Button size="sm" onClick={() => setShowModal(true)} className="gap-1.5 shadow">
                <Plus className="h-4 w-4" /> Buat Cohort Baru
              </Button>
            </div>
          </div>

          {/* Modal Form */}
          {showModal && (
            <Card className="border-primary/40 bg-muted/20 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Form Tambah Cohort / Angkatan</CardTitle>
              </CardHeader>
              <form onSubmit={handleCreateCohort}>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="cname">Nama Grup / Angkatan</Label>
                    <Input id="cname" placeholder="Misal: Batch 1 - Network Engineering 2026" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cdesc">Keterangan / Instansi</Label>
                    <Input id="cdesc" placeholder="Misal: Peserta Pelatihan ISP Internal" value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                </CardContent>
                <div className="p-4 bg-muted/30 border-t flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Batal</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan Grup'}</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Daftar Cohort */}
          <Card className="border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle className="text-base font-bold">Daftar Grup Terdaftar ({cohorts.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Memuat data cohort...</div>
              ) : cohorts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Belum ada grup cohort terdaftar.</div>
              ) : (
                <div className="divide-y">
                  {cohorts.map((c) => (
                    <div key={c.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                          <Layers className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{c.name}</h4>
                          <p className="text-xs text-muted-foreground">{c.description || 'Tidak ada deskripsi'}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-mono text-xs gap-1">
                        <Users2 className="h-3 w-3" /> {c.member_count} Anggota
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
