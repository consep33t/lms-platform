import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Profil Pengguna</h1>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="font-medium">Nama:</span> {user?.full_name || '-'}</div>
            <div><span className="font-medium">Email:</span> {user?.email || '-'}</div>
            <div><span className="font-medium">Role:</span> {user?.role || 'user'}</div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
