import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KeyRound, Plus, RefreshCw, CheckCircle2, XCircle, Copy } from 'lucide-react'
import api from '@/lib/api'

interface AdminTokenItem {
  id: number
  module_id: number
  token_code: string
  max_uses: number
  current_uses: number
  expired_at: string
  is_active: boolean
}

export default function AdminTokensPage() {
  const [tokens, setTokens] = useState<AdminTokenItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [moduleId, setModuleId] = useState(1)
  const [count, setCount] = useState(1)
  const [maxUses, setMaxUses] = useState(100)
  const [daysValid, setDaysValid] = useState(30)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/tokens')
      setTokens(res.data)
    } catch (err) {
      console.error('Failed to fetch tokens', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await api.post('/admin/tokens/bulk', {
        module_id: moduleId,
        count: count,
        max_uses: maxUses,
        days_valid: daysValid,
      })
      setShowModal(false)
      fetchTokens()
    } catch (err) {
      alert('Gagal membuat token baru.')
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
              <h1 className="text-2xl font-bold tracking-tight">Manajemen Token Akses Modul</h1>
              <p className="text-muted-foreground text-sm">Kelola token akses peserta, kuota penggunaan, dan masa berlaku.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchTokens} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
              <Button size="sm" onClick={() => setShowModal(true)} className="gap-1.5 shadow">
                <Plus className="h-4 w-4" /> Generate Token Baru
              </Button>
            </div>
          </div>

          {/* Modal Generator */}
          {showModal && (
            <Card className="border-primary/40 bg-muted/20 shadow-md">
              <CardHeader><CardTitle className="text-lg">Generator Token Pembelajaran</CardTitle></CardHeader>
              <form onSubmit={handleGenerate}>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="tmod">Modul Target (ID)</Label>
                    <Input id="tmod" type="number" min="1" value={moduleId} onChange={(e) => setModuleId(parseInt(e.target.value))} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tcount">Jumlah Token Dibuat</Label>
                    <Input id="tcount" type="number" min="1" max="50" value={count} onChange={(e) => setCount(parseInt(e.target.value))} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tuses">Maksimal Penggunaan</Label>
                    <Input id="tuses" type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(parseInt(e.target.value))} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tdays">Masa Berlaku (Hari)</Label>
                    <Input id="tdays" type="number" min="1" value={daysValid} onChange={(e) => setDaysValid(parseInt(e.target.value))} required />
                  </div>
                </CardContent>
                <div className="p-4 bg-muted/30 border-t flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Batal</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Membuat...' : 'Generate Token'}</Button>
                </div>
              </form>
            </Card>
          )}

          {/* Tabel Token */}
          <Card className="border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle className="text-base font-bold">Daftar Token Terdaftar ({tokens.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Memuat data token...</div>
              ) : tokens.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Belum ada token.</div>
              ) : (
                <div className="divide-y">
                  {tokens.map((t) => (
                    <div key={t.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                          <KeyRound className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-base text-foreground">{t.token_code}</span>
                            <Badge variant={t.is_active ? 'default' : 'secondary'} className={t.is_active ? 'bg-emerald-600' : ''}>
                              {t.is_active ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Modul ID #{t.module_id} � Penggunaan: <strong>{t.current_uses}</strong> / {t.max_uses} Peserta
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        Kadaluarsa: {new Date(t.expired_at).toLocaleDateString('id-ID')}
                      </div>
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
