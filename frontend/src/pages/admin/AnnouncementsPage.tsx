import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Megaphone, Send, Mail, Users, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import api from '@/lib/api'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/context/FeedbackContext'

export default function AdminAnnouncementsPage() {
  usePageTitle('Pusat Pengumuman & Siaran — CMS Admin')
  const { success, error } = useToast()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [targetRole, setTargetRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return

    try {
      setLoading(true)
      setSuccessMessage(null)
      setErrorMessage(null)

      const res = await api.post('/admin/announcements', {
        title: title.trim(),
        body: body.trim(),
        send_email: sendEmail,
        target_role: targetRole || null,
      })

      success('Pengumuman Disiarkan!', 'Pesan pengumuman telah dikirimkan ke target peserta.')
      setSuccessMessage(res.data.message || 'Pengumuman berhasil disiarkan ke seluruh peserta!')
      setTitle('')
      setBody('')
    } catch (err: any) {
      const errDetail = err.response?.data?.detail || 'Gagal menyiarkan pengumuman.'
      error(errDetail)
      setErrorMessage(errDetail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-4xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-primary" /> Siaran Pengumuman Massal
            </h1>
            <p className="text-muted-foreground text-sm">
              Kirimkan pemberitahuan penting secara langsung ke pusat notifikasi aplikasi seluruh peserta dan email mereka.
            </p>
          </div>

          {successMessage && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div className="font-semibold">{successMessage}</div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div className="font-semibold">{errorMessage}</div>
            </div>
          )}

          <Card className="border-border/80 shadow-md overflow-hidden">
            <form onSubmit={handleBroadcast}>
              <CardHeader className="bg-muted/15 border-b pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" /> Buat Siaran Baru
                </CardTitle>
                <CardDescription className="text-xs">
                  Notifikasi akan langsung muncul di bell icon peserta dan dikirimkan asinkron via Celery worker.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Judul Pengumuman</label>
                  <Input
                    placeholder="Contoh: Pemeliharaan Server & Penambahan Modul Baru"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="text-xs h-10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Target Penerima</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">👥 Semua Pengguna (User & Admin)</option>
                    <option value="user">🎓 Peserta Pelatihan Saja</option>
                    <option value="admin">🛡️ Administrator Saja</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Isi Pesan Pengumuman</label>
                  <textarea
                    rows={6}
                    placeholder="Tuliskan isi pengumuman secara rinci..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg border bg-background text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl border bg-muted/20 text-xs">
                  <input
                    type="checkbox"
                    id="send_email"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="send_email" className="font-semibold text-foreground flex items-center gap-1.5 cursor-pointer">
                    <Mail className="h-3.5 w-3.5 text-primary" /> Kirim salinan pengumuman ke email peserta via SMTP
                  </label>
                </div>
              </CardContent>

              <CardFooter className="border-t bg-muted/10 p-4 flex justify-end">
                <Button type="submit" disabled={loading || !title.trim() || !body.trim()} className="gap-2 font-bold text-xs shadow-sm">
                  <Send className="h-3.5 w-3.5" />
                  {loading ? 'Menyiarkan...' : 'Siarkan Pengumuman'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </main>
      </div>
    </div>
  )
}
