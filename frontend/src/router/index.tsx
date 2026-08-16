import React, { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { useAuthStore } from '@/store/authStore'

// Fast lightweight loading spinner for route suspense
const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 p-6 animate-pulse">
    <div className="h-8 w-8 rounded-full border-3 border-primary border-t-transparent animate-spin" />
    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Memuat Halaman...</span>
  </div>
)

const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

// Public & Auth Pages (Lazy Loaded)
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const VerifyPage = lazy(() => import('@/pages/VerifyPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// User Dashboard & Learning Pages (Lazy Loaded)
const DashboardPage = lazy(() => import('@/pages/user/DashboardPage'))
const ModuleDetailPage = lazy(() => import('@/pages/user/ModuleDetailPage'))
const SessionPage = lazy(() => import('@/pages/user/SessionPage'))
const HistoryPage = lazy(() => import('@/pages/user/HistoryPage'))
const ProfilePage = lazy(() => import('@/pages/user/ProfilePage'))
const CertificatesPage = lazy(() => import('@/pages/user/CertificatesPage'))
const LeaderboardPage = lazy(() => import('@/pages/user/LeaderboardPage'))
const StudyRoomsPage = lazy(() => import('@/pages/user/StudyRoomsPage'))
const CheckoutPage = lazy(() => import('@/pages/user/CheckoutPage'))
const OrderHistoryPage = lazy(() => import('@/pages/user/OrderHistoryPage'))
const AboutPage = lazy(() => import('@/pages/user/AboutPage'))

// Admin CMS & Operations Pages (Lazy Loaded)
const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const AdminModulesPage = lazy(() => import('@/pages/admin/ModulesPage'))
const AdminUsersPage = lazy(() => import('@/pages/admin/UsersPage'))
const AdminTokensPage = lazy(() => import('@/pages/admin/TokensPage'))
const AdminCohortsPage = lazy(() => import('@/pages/admin/CohortsPage'))
const AdminReportsPage = lazy(() => import('@/pages/admin/ReportsPage'))
const SessionBuilderPage = lazy(() => import('@/pages/admin/SessionBuilderPage'))
const AdminAuditLogsPage = lazy(() => import('@/pages/admin/AuditLogsPage'))
const AdminAnnouncementsPage = lazy(() => import('@/pages/admin/AnnouncementsPage'))
const TenantManagementPage = lazy(() => import('@/pages/admin/TenantManagementPage'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'))
const AdminScormManagerPage = lazy(() => import('@/pages/admin/AdminScormManagerPage'))
const AdminSSOConfigPage = lazy(() => import('@/pages/admin/AdminSSOConfigPage'))

function HomeRoute() {
  const user = useAuthStore((s) => s.user)
  if (!user) {
    return withSuspense(LandingPage)
  }
  return withSuspense(DashboardPage)
}

export const router = createBrowserRouter([
  { path: '/landing', element: withSuspense(LandingPage) },
  { path: '/login', element: withSuspense(LoginPage) },
  { path: '/register', element: withSuspense(RegisterPage) },
  { path: '/forgot-password', element: withSuspense(ForgotPasswordPage) },
  {
    path: '/',
    element: <HomeRoute />,
    errorElement: withSuspense(NotFoundPage),
  },
  {
    path: '/modules/:moduleSlug',
    element: <ProtectedRoute>{withSuspense(ModuleDetailPage)}</ProtectedRoute>,
  },
  {
    path: '/sessions/:id',
    element: <ProtectedRoute>{withSuspense(SessionPage)}</ProtectedRoute>,
  },
  {
    path: '/history',
    element: <ProtectedRoute>{withSuspense(HistoryPage)}</ProtectedRoute>,
  },
  {
    path: '/profile',
    element: <ProtectedRoute>{withSuspense(ProfilePage)}</ProtectedRoute>,
  },
  {
    path: '/certificates',
    element: <ProtectedRoute>{withSuspense(CertificatesPage)}</ProtectedRoute>,
  },
  {
    path: '/leaderboard',
    element: <ProtectedRoute>{withSuspense(LeaderboardPage)}</ProtectedRoute>,
  },
  {
    path: '/verify',
    element: withSuspense(VerifyPage),
  },
  {
    path: '/verify/:code',
    element: withSuspense(VerifyPage),
  },
  {
    path: '/about',
    element: <ProtectedRoute>{withSuspense(AboutPage)}</ProtectedRoute>,
  },

  // Admin Routes
  {
    path: '/admin',
    element: <ProtectedRoute requireAdmin>{withSuspense(AdminDashboardPage)}</ProtectedRoute>,
  },
  {
    path: '/admin/tenants',
    element: <ProtectedRoute requireAdmin>{withSuspense(TenantManagementPage)}</ProtectedRoute>,
  },
  {
    path: '/admin/modules',
    element: <ProtectedRoute requireAdmin>{withSuspense(AdminModulesPage)}</ProtectedRoute>,
  },
  {
    path: '/admin/modules/:moduleId/sessions/:sessionId/builder',
    element: <ProtectedRoute requireAdmin>{withSuspense(SessionBuilderPage)}</ProtectedRoute>,
  },
  {
    path: '/admin/users',
    element: <ProtectedRoute requireAdmin>{withSuspense(AdminUsersPage)}</ProtectedRoute>,
  },
  {
    path: '/admin/tokens',
    element: <ProtectedRoute requireAdmin>{withSuspense(AdminTokensPage)}</ProtectedRoute>,
  },
  {
    path: '/admin/cohorts',
    element: <ProtectedRoute requireAdmin>{withSuspense(AdminCohortsPage)}</ProtectedRoute>,
  },
  {
    path: '/admin/reports',
    element: <ProtectedRoute requireAdmin>{withSuspense(AdminReportsPage)}</ProtectedRoute>,
  },
  {
    path: '/admin/audit-logs',
    element: <ProtectedRoute requireAdmin>{withSuspense(AdminAuditLogsPage)}</ProtectedRoute>,
  },
  {
    path: '/admin/announcements',
    element: <ProtectedRoute requireAdmin>{withSuspense(AdminAnnouncementsPage)}</ProtectedRoute>,
  },
  {
    path: '/study-rooms',
    element: <ProtectedRoute>{withSuspense(StudyRoomsPage)}</ProtectedRoute>,
  },
  {
    path: '/checkout/:moduleId',
    element: <ProtectedRoute>{withSuspense(CheckoutPage)}</ProtectedRoute>,
  },
  {
    path: '/orders',
    element: <ProtectedRoute>{withSuspense(OrderHistoryPage)}</ProtectedRoute>,
  },
  {
    path: '/admin/orders',
    element: <ProtectedRoute requireAdmin>{withSuspense(AdminOrdersPage)}</ProtectedRoute>,
  },
  {
    path: '/admin/scorm',
    element: <ProtectedRoute requireAdmin>{withSuspense(AdminScormManagerPage)}</ProtectedRoute>,
  },
  {
    path: '/admin/sso',
    element: <ProtectedRoute requireAdmin>{withSuspense(AdminSSOConfigPage)}</ProtectedRoute>,
  },

  {
    path: '*',
    element: withSuspense(NotFoundPage),
  },
])
