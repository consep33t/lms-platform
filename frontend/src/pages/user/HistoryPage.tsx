import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function HistoryPage() {
  return (
    <PageLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Riwayat Pembelajaran</h1>
        <Card>
          <CardHeader>
            <CardTitle>Modul yang Telah Diselesaikan</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Belum ada modul yang selesai. Selesaikan modul pertama Anda untuk melihat skor dan mengunduh sertifikat.
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
