import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default function SessionPage() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Sesi 1: Dasar Protokol TCP/IP</h2>
            <p className="text-sm text-muted-foreground">Pelajari arsitektur layer dan encapsulation.</p>
          </div>
          <div className="w-48 text-right space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Progress Sesi: 25%</span>
            <Progress value={25} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Materi 1: Pengantar Layer OSI & TCP/IP</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-sm text-foreground/90 space-y-4">
            <p>
              Protokol TCP/IP merupakan standar komunikasi data yang digunakan pada jaringan internet global.
              Tiap lapisan bertugas memproses paket data secara bertahap mulai dari Application, Transport, Internet, hingga Network Access.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" disabled>Sebelumnya</Button>
            <Button>Lanjut ke Soal</Button>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  )
}
