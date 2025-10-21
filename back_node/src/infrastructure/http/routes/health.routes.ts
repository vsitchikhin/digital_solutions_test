import { Router } from 'express';
import { type HealthHandler } from '@/infrastructure/http/handlers/health.handler';

export default function useHealthRouter(healtHandler: HealthHandler) {
  const router = Router();

  router.get('/', healtHandler.get);

  return router;
}