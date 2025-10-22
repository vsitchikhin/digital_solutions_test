export const config = {
  apiUrl: (import.meta.env.BASE_URL as string | undefined) || '',
  defaultLimitRaw: Number(import.meta.env.DEFAULT_LIMIT) || 20,
  maxLimitRaw: Number(import.meta.env.MAX_LIMIT) || 100,
};