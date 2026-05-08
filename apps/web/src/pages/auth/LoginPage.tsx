import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { setAuth } = useAuth()
  const [error, setError] = useState('')

  // 有 code → 处理飞书回调登录
  useEffect(() => {
    const code = params.get('code')
    if (!code) return

    authApi.login(code)
      .then((res) => {
        setAuth(res.token, res.user)
        navigate('/business', { replace: true })
      })
      .catch((err) => setError(err.message))
  }, [params])

  // 无 code → 直接跳转飞书登录
  useEffect(() => {
    if (error) return
    if (params.get('code')) return

    authApi.getAuthUrl()
      .then((res) => { window.location.href = res.url })
      .catch(() => setError('无法获取登录地址，请检查后端服务'))
  }, [error])

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ padding: 40, background: '#fff', borderRadius: 8, textAlign: 'center' }}>
          <p style={{ color: '#ff4d4f', marginBottom: 16 }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 24px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>重试</button>
        </div>
      </div>
    )
  }

  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>跳转飞书登录中...</div>
}
