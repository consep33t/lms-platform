import { LoginForm } from '@/features/auth/components/LoginForm'
import { AuthLayout } from '@/components/templates/AuthLayout'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function LoginPage() {
  usePageTitle('Masuk ke Akun Pembelajaran')
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
