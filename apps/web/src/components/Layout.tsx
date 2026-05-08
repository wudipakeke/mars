import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { user, logout } = useAuth()

  const navItems = [
    { path: '/business', label: '业务管理' },
    { path: '/cron-config', label: '定时任务配置' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: 200, padding: 16, borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        <div>
          <h2>Mars</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {navItems.map((item) => (
              <li key={item.path} style={{ marginBottom: 8 }}>
                <Link
                  to={item.path}
                  style={{
                    color: location.pathname === item.path ? '#1677ff' : '#333',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    textDecoration: 'none',
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {user && (
          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #e0e0e0' }}>
            <div style={{ fontSize: 14, marginBottom: 8 }}>{user.name}</div>
            <button
              onClick={logout}
              style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 0, fontSize: 13 }}
            >
              退出登录
            </button>
          </div>
        )}
      </nav>
      <main style={{ flex: 1, padding: 24 }}>
        {children}
      </main>
    </div>
  )
}
