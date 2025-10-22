import { endpoints } from '@/shared/api/endpoints';
import { apiFetch } from '@/shared/api/fetch';

export async function health<T = unknown>(): Promise<T> {
  return apiFetch<T>(endpoints.health, { method: 'GET' });
}