import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx'
import type { ReactNode } from 'react'
import Layout from './components/Layout.tsx'
import LoginPage from './pages/auth/LoginPage.tsx'
import BusinessPage from './pages/business/BusinessPage.tsx'
import CronConfigPage from './pages/cron-config/CronConfigPage.tsx'

/** 根路径跳转 */
function RootRedirect() {
  const { user, ready } = useAuth()
  if (!ready) return null
  return <Navigate to={user ? '/business' : '/auth'} replace />
}

/** 登录守卫 */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth()
  if (!ready) return <div style={{ padding: 40, textAlign: 'center' }}>加载中...</div>
  if (!user) return <Navigate to="/auth" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/business" element={<ProtectedRoute><BusinessPage /></ProtectedRoute>} />
          <Route path="/cron-config" element={<ProtectedRoute><CronConfigPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
