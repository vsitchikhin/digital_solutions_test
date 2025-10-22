import { config } from './index';

function parsePositiveInt(value: unknown): number | undefined {
  const number = typeof value === 'string' ? parseInt(value, 10) : typeof value === 'number' ? value : NaN;
  if (!Number.isFinite(number) || number <= 0) return undefined;
  return Math.floor(number);
}

export function getMaxLimit(): number | undefined {
  return parsePositiveInt(config.maxLimitRaw);
}

export function getDefaultLimit(): number | undefined {
  const maxLimit = getMaxLimit();
  const defaultLimit = parsePositiveInt(config.defaultLimitRaw);
  if (defaultLimit == null) return undefined;
  return maxLimit != null ? Math.min(defaultLimit, maxLimit) : defaultLimit;
}

export function normalizeLimit(requested?: number): number | undefined {
  const maxLimit = getMaxLimit();
  const defaultLimit = getDefaultLimit();
  if (requested == null || !Number.isFinite(requested) || requested <= 0) {
    return defaultLimit;
  }
  const number = Math.floor(requested);
  return maxLimit != null ? Math.min(number, maxLimit) : number;
}
