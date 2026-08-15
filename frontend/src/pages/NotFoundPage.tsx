import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border bg-card shadow-xl">
        <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-foreground">Halaman Tidak Ditemukan</h1>
          <p className="text-sm text-muted-foreground">
            URL yang Anda tuju tidak tersedia atau telah dipindahkan.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="h-4 w-4" /> Beranda
            </Button>
          </Link>
          <Link to="/admin/modules">
            <Button variant="default" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Menu Modul
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
