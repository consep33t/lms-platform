import { createBrowserRouter, Navigate } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import DashboardPage from '@/pages/user/DashboardPage'
import ModuleDetailPage from '@/pages/user/ModuleDetailPage'
import SessionPage from '@/pages/user/SessionPage'
import HistoryPage from '@/pages/user/HistoryPage'
import ProfilePage from '@/pages/user/ProfilePage'
import AboutPage from '@/pages/user/AboutPage'
import AdminDashboardPage from '@/pages/admin/DashboardPage'
import AdminModulesPage from '@/pages/admin/ModulesPage'
import AdminUsersPage from '@/pages/admin/UsersPage'
import AdminTokensPage from '@/pages/admin/TokensPage'
import AdminCohortsPage from '@/pages/admin/CohortsPage'
import AdminReportsPage from '@/pages/admin/ReportsPage'
import SessionBuilderPage from '@/pages/admin/SessionBuilderPage'
import NotFoundPage from '@/pages/NotFoundPage'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { useAuthStore } from '@/store/authStore'

function HomeRoute() {
  const user = useAuthStore((s) => s.user)
  if (!user) {
    return <LandingPage />
  }
  return <DashboardPage />
}

export const router = createBrowserRouter([
  { path: '/landing', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  {
    path: '/',
    element: <HomeRoute />,
    errorElement: <NotFoundPage />,
  },
  {
    path: '/modules/:id',
    element: <ProtectedRoute><ModuleDetailPage /></ProtectedRoute>,
  },
  {
    path: '/sessions/:id',
    element: <ProtectedRoute><SessionPage /></ProtectedRoute>,
  },
  {
    path: '/history',
    element: <ProtectedRoute><HistoryPage /></ProtectedRoute>,
  },
  {
    path: '/profile',
    element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
  },
  {
    path: '/about',
    element: <ProtectedRoute><AboutPage /></ProtectedRoute>,
  },
  {
    path: '/admin',
    element: <ProtectedRoute requireAdmin><AdminDashboardPage /></ProtectedRoute>,
  },
  {
    path: '/admin/modules',
    element: <ProtectedRoute requireAdmin><AdminModulesPage /></ProtectedRoute>,
  },
  {
    path: '/admin/modules/:moduleId/sessions/:sessionId/builder',
    element: <ProtectedRoute requireAdmin><SessionBuilderPage /></ProtectedRoute>,
  },
  {
    path: '/admin/users',
    element: <ProtectedRoute requireAdmin><AdminUsersPage /></ProtectedRoute>,
  },
  {
    path: '/admin/tokens',
    element: <ProtectedRoute requireAdmin><AdminTokensPage /></ProtectedRoute>,
  },
  {
    path: '/admin/cohorts',
    element: <ProtectedRoute requireAdmin><AdminCohortsPage /></ProtectedRoute>,
  },
  {
    path: '/admin/reports',
    element: <ProtectedRoute requireAdmin><AdminReportsPage /></ProtectedRoute>,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
