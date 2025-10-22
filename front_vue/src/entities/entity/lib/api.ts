import type {
  GetListParams,
  GetSelectedParams,
  ListResponse,
  QueueCreateBody, QueueMutateBody,
  QueueResponse,
} from '@/entities/entity/model/dto';
import { toQuery } from '@/shared/lib/io';
import { endpoints } from '@/shared/api/endpoints';
import { apiFetch } from '@/shared/api/fetch';

export async function list(params: GetListParams = {}): Promise<ListResponse> {
  const queryString = toQuery(params as Record<string, unknown>);
  const url = queryString ? `${endpoints.entities.list}?${queryString}` : endpoints.entities.list;
  return apiFetch<ListResponse>(url, { method: 'GET' });
}

export async function selectedList(params: GetSelectedParams): Promise<ListResponse> {
  const queryString = toQuery(params as Record<string, unknown>);
  const url = queryString ? `${endpoints.entities.selected}?${queryString}` : endpoints.entities.selected;
  return apiFetch<ListResponse>(url, { method: 'GET' });
}

export async function queueCreate(body: QueueCreateBody): Promise<QueueResponse> {
  return apiFetch<QueueResponse>(endpoints.entities.queueCreate, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function queueMutate(body: QueueMutateBody): Promise<QueueResponse> {
  return apiFetch<QueueResponse>(endpoints.entities.queueUpdate, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function reset(): Promise<{ok: true}> {
  return apiFetch<{ok: true}>(endpoints.entities.reset, { method: 'POST' });
}