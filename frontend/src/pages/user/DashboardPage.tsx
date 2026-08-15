import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

export default function DashboardPage() {
  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Modul Pembelajaran</h1>
          <p className="text-muted-foreground">Pilih modul untuk memulai sesi belajar atau masukkan token akses modul.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="outline">Teknologi</Badge>
                <Badge variant="secondary">Terkunci Token</Badge>
              </div>
              <CardTitle className="mt-2">Pengenalan Jaringan Komputer</CardTitle>
              <CardDescription>Pelajari konsep dasar subnetting, routing, dan troubleshooting jaringan.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> 4 Sesi Pembelajaran + Kuis
              </div>
            </CardContent>
            <CardFooter>
              <Link to="/modules/1" className="w-full">
                <Button className="w-full">Buka Modul</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
