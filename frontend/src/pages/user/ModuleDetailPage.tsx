import { useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KeyRound, Lock, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ModuleDetailPage() {
  const [token, setToken] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const navigate = useNavigate()

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (token.trim()) {
      setIsUnlocked(true)
    }
  }

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengenalan Jaringan Komputer</h1>
          <p className="text-muted-foreground mt-1">Modul Pembelajaran Terstruktur</p>
        </div>

        {!isUnlocked ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Lock className="h-5 w-5" /> Modul Terkunci
              </div>
              <CardDescription>
                Masukkan token akses 8 digit yang diberikan oleh admin/instruktur untuk membuka materi dan kuis.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleVerify}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Token Akses Modul</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="token"
                      className="pl-9 font-mono uppercase tracking-widest text-base"
                      placeholder="CONTOH: ABC123XYZ"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">Verifikasi & Buka Modul</Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader>
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <CheckCircle2 className="h-5 w-5" /> Token Terverifikasi
              </div>
              <CardDescription>Akses Anda aktif. Silakan mulai sesi pembelajaran pertama.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate('/sessions/1')} className="w-full">Mulai Sesi 1</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </PageLayout>
  )
}
