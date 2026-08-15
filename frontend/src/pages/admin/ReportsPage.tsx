import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function AdminReportsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 space-y-6">
          <h1 className="text-2xl font-bold">Laporan & Analitik Hasil</h1>
          <Card><CardHeader><CardTitle>Laporan Penyelesaian & Skor</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Export data nilai dalam format PDF atau Excel.</CardContent></Card>
        </main>
      </div>
    </div>
  )
}
