import { config } from '@/shared/config';
import { safeJSON } from '@/shared/lib/io';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildUrl(path);
  console.log('request url ----------- ', url);

  const headers = new Headers(init?.headers);
  if (init?.body !== null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    let message = `HTTP ${res.status} ${res.statusText}`;
    try {
      const data = await res.clone().json() as unknown;

      if (data && typeof data === 'object') {
        const maybeErr = (data as {error?: string; message?: string; details?: unknown});
        message = maybeErr.error || maybeErr.message || message;
      }
    } catch {
      try {
        const text = await res.text();
        if (text) message = `${message}: ${text}`;
      } catch {}
    }
    throw new Error(message);
  }

  return safeJSON<T>(res);
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;

  console.log('api url ---------- ', config.apiUrl);
  const base = (config.apiUrl || '')
    .replace(/^['"]|['"]$/g, '')
    .replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '');
  return base ? `${base}/${p}` : `/${p}`;
}