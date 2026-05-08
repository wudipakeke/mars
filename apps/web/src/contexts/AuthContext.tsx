import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { UserInfo } from '../api/auth'
import { authApi } from '../api/auth'

let globalLogout: (() => void) | null = null

interface AuthState {
  user: UserInfo | null
  token: string | null
  setAuth: (token: string, user: UserInfo) => void
  logout: () => void
  ready: boolean
}

const AuthContext = createContext<AuthState>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('mars-auth')
  }, [])

  // 设置全局 logout，供 API client 在 401 时调用
  useEffect(() => {
    globalLogout = logout
    return () => { globalLogout = null }
  }, [logout])

  // 启动时恢复 token 并向服务器验证
  useEffect(() => {
    const stored = localStorage.getItem('mars-auth')
    if (!stored) {
      setReady(true)
      return
    }

    let parsed: { token: string; user: UserInfo }
    try { parsed = JSON.parse(stored) } catch {
      logout()
      setReady(true)
      return
    }

    // 临时设置 token，然后向后端验证
    setToken(parsed.token)
    setUser(parsed.user)

    authApi.me()
      .then((userInfo) => {
        // token 有效，更新用户信息
        setUser(userInfo)
        localStorage.setItem('mars-auth', JSON.stringify({ token: parsed.token, user: userInfo }))
      })
      .catch(() => {
        // token 过期或无效，清除登录状态
        logout()
      })
      .finally(() => setReady(true))
  }, [logout])

  const setAuth = (newToken: string, newUser: UserInfo) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('mars-auth', JSON.stringify({ token: newToken, user: newUser }))
  }

  return (
    <AuthContext.Provider value={{ user, token, setAuth, logout, ready }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export const getGlobalLogout = () => globalLogout
