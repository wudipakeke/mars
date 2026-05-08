import { api } from './client'

export interface UserInfo {
  openId: string
  name: string
  avatar: string
}

export interface LoginResult {
  token: string
  user: UserInfo
}

export const authApi = {
  /** 获取飞书 OAuth 地址 */
  getAuthUrl: () => api.get<{ url: string }>('/auth/url'),

  /** 用 code 登录 */
  login: (code: string) => api.post<LoginResult>('/auth/login', { code }),

  /** 获取当前用户 */
  me: () => api.get<UserInfo>('/auth/me'),
}
