export const endpoints = {
  entities: {
    list: '/api/entities/list',
    selected: '/api/entities/selected',
    queueCreate: '/api/entities/queue/create',
    queueUpdate: '/api/entities/queue/mutate',
    reset: '/api/entities/reset',
  },
  health: '/api/health',
} as const;