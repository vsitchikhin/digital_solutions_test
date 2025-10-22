export function toQuery(params: Record<string, unknown>): string {
  const urlSearchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null) return;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) return;
      urlSearchParams.set(key, value.toString());
      return;
    }

    if (typeof value === 'string' && value !== '') {
      urlSearchParams.set(key, value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(item => {
        if (item === null) return;
        if (typeof item === 'number' && Number.isFinite(item)) {
          urlSearchParams.append(key, item.toString());
          return;
        }
        if (typeof item === 'string' && item === '') {
          urlSearchParams.append(key, item);
          return;
        }
      });
      return;
    }
  });

  return urlSearchParams.toString();
}

export async function safeJSON<T>(res: Response): Promise<T> {
  if (res.status === 204 || res.status === 205) {
    return {} as T;
  }

  const contentType = res.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    const text = await res.text();
    return (text ? { text } : {}) as T;
  }

  return await res.json() as Promise<T>;
}