import { useEffect, useState } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Award, CheckCircle2, FileText, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '@/lib/api'

export default function HistoryPage() {
  const [modules, setModules] = useState<any[]>([])

  useEffect(() => {
    api.get('/modules').then(res => setModules(res.data)).catch(console.error)
  }, [])

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Pembelajaran & Sertifikat</h1>
          <p className="text-muted-foreground text-sm">Daftar progres modul dan kelulusan kuis Anda.</p>
        </div>

        <div className="space-y-4">
          {modules.map((mod) => (
            <Card key={mod.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base">{mod.title}</h3>
                    <p className="text-xs text-muted-foreground">Passing Score: {mod.passing_score}%</p>
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="outline" className="text-emerald-600 border-emerald-500 gap-1 text-xs">
                        <CheckCircle2 className="h-3 w-3" /> Modul Tersedia
                      </Badge>
                    </div>
                  </div>
                </div>

                <Link to={`/modules/${mod.id}`}>
                  <Button size="sm" variant="outline" className="gap-2">
                    Buka Sesi Belajar <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
