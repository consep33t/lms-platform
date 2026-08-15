import { createBrowserRouter } from 'react-router-dom'
import LoginPage from '@/pages/auth/LoginPage'
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
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  {
    path: '/',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
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
])
