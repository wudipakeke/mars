import { api } from './client';

export interface CronConfigItem {
  id: number;
  name: string;
  cronExpr: string;
  taskType: string;
  taskParams: string | null;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionLogItem {
  id: number;
  configId: number;
  startTime: string;
  endTime: string | null;
  status: number | null;
  errorMsg: string | null;
  env: string;
  createdAt: string;
}

export const cronConfigApi = {
  list: () => api.get<CronConfigItem[]>('/cron-config'),
  get: (id: number) => api.get<CronConfigItem>(`/cron-config/${id}`),
  create: (data: { name: string; cronExpr: string; taskType: string; taskParams?: string }) =>
    api.post<CronConfigItem>('/cron-config', data),
  update: (id: number, data: { name?: string; cronExpr?: string; taskType?: string; taskParams?: string; status?: number }) =>
    api.put<CronConfigItem>(`/cron-config/${id}`, data),
  delete: (id: number) => api.delete<void>(`/cron-config/${id}`),
  logs: (id: number, env?: string) =>
    api.get<ExecutionLogItem[]>(`/cron-config/${id}/logs${env ? `?env=${env}` : ''}`),
  execute: (id: number) =>
    api.post<{ message: string }>(`/cron-config/${id}/execute`, {}),
};
