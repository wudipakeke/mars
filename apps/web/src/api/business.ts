import { api } from './client';

export interface BusinessItem {
  id: number;
  title: string;
  content: string | null;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export const businessApi = {
  list: () => api.get<BusinessItem[]>('/business'),
  get: (id: number) => api.get<BusinessItem>(`/business/${id}`),
  create: (data: { title: string; content?: string }) => api.post<BusinessItem>('/business', data),
  update: (id: number, data: { title?: string; content?: string; status?: number }) =>
    api.put<BusinessItem>(`/business/${id}`, data),
  delete: (id: number) => api.delete<void>(`/business/${id}`),
};
