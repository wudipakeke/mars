import type { ApiResponse } from '@mars/shared'
import { getGlobalLogout } from '../contexts/AuthContext'

const BASE_URL = '/api'

function getToken(): string | null {
  try {
    const stored = localStorage.getItem('mars-auth')
    return stored ? JSON.parse(stored).token : null
  } catch {
    return null
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${url}`, { headers, ...options })

  // 401 → token 过期，自动退出
  if (res.status === 401) {
    getGlobalLogout?.()
    window.location.href = '/auth'
    throw new Error('登录已过期，请重新登录')
  }

  // 非 2xx → 抛出错误
  if (!res.ok) {
    let message = `请求失败 (${res.status})`
    try {
      const errBody = await res.json()
      message = errBody.message || message
    } catch { /* ignore */ }
    throw new Error(message)
  }

  const data = await res.json() as ApiResponse<T>
  // 兼容两种返回格式: {code, data, message} 和 直接返回数据
  if (data !== null && typeof data === 'object' && 'code' in data) {
    if (data.code !== 0) throw new Error(data.message || '请求失败')
    return data.data
  }
  return data as T
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
}
