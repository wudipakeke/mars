import { api } from './client'

export interface NovelAdminItem {
  id: number
  openId: string
  title: string
  genre: string | null
  wordCount: number
  status: number
  createdAt: string
  updatedAt: string
}

export const novelAdminApi = {
  list: () => api.get<NovelAdminItem[]>('/novel-admin'),
}
