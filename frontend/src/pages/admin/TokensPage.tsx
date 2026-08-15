import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function AdminTokensPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Manajemen Token Akses Modul</h1>
            <Button className="flex items-center gap-2"><Plus className="h-4 w-4" /> Generate Token Baru</Button>
          </div>
          <Card><CardHeader><CardTitle>Token Terdaftar</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Kelola masa berlaku, status aktif, dan limitasi peserta.</CardContent></Card>
        </main>
      </div>
    </div>
  )
}
