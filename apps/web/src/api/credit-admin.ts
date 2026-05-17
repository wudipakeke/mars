import { api } from './client'

export interface CreditPackageItem {
  id: number
  name: string
  description: string | null
  points: number
  priceCent: number
  sortOrder: number
  isActive: boolean
}

export interface CreditOrderItem {
  id: number
  openId: string
  points: number
  amountCent: number
  status: number
  paidAt: string | null
  createdAt: string
}

export interface CreditLogItem {
  id: number
  openId: string
  points: number
  balanceAfter: number
  action: string
  createdAt: string
}

export const creditAdminApi = {
  // Packages
  listPackages: () => api.get<CreditPackageItem[]>('/ai-credit/packages'),
  createPackage: (data: { name: string; points: number; priceCent: number; description?: string }) =>
    api.post<CreditPackageItem>('/credit-admin/packages', data),
  updatePackage: (id: number, data: Partial<CreditPackageItem>) =>
    api.put<CreditPackageItem>(`/credit-admin/packages/${id}`, data),
  deletePackage: (id: number) => api.delete<void>(`/credit-admin/packages/${id}`),

  // Orders
  listOrders: () => api.get<CreditOrderItem[]>('/credit-admin/orders'),
  confirmOrder: (id: number) => api.post<void>(`/credit-admin/orders/${id}/confirm`, {}),
  refundOrder: (id: number) => api.post<void>(`/credit-admin/orders/${id}/refund`, {}),

  // Logs
  listLogs: () => api.get<CreditLogItem[]>('/credit-admin/logs'),
}
