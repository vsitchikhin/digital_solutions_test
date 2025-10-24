export const config = {
  apiUrl:
    (__APP_CONFIG__?.VITE_API_URL as string) ||
    (import.meta.env.VITE_API_URL || '/api'),
  defaultLimitRaw:
    Number(__APP_CONFIG__?.VITE_DEFAULT_LIMIT) ||
    Number(import.meta.env.VITE_DEFAULT_LIMIT || 20),
  maxLimitRaw:
    Number(__APP_CONFIG__?.VITE_MAX_LIMIT) ||
    Number(import.meta.env.VITE_MAX_LIMIT || 100),
};

declare global {
  const __APP_CONFIG__: {
    VITE_API_URL: string;
    VITE_DEFAULT_LIMIT: number;
    VITE_MAX_LIMIT: number;
  };
}
