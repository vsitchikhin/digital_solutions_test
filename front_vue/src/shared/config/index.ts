export const config = {
  apiUrl: (__APP_CONFIG__?.BASE_URL as string) || '',
  defaultLimitRaw: Number(__APP_CONFIG__.DEFAULT_LIMIT) || 20,
  maxLimitRaw: Number(__APP_CONFIG__.MAX_LIMIT) || 100,
};

declare global {
  const __APP_CONFIG__: {
    BASE_URL: string;
    DEFAULT_LIMIT: number;
    MAX_LIMIT: number;
  };
}