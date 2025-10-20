import { Router } from 'express';
import { EntitiesHandler } from '@/infrastructure/http/handlers/entities.handler';

export default function useEntitiesRouter() {
  const router = Router();
  const entitiesHandler = new EntitiesHandler();

  router.get('/list', entitiesHandler.getList);
  router.get('/selected', entitiesHandler.getSelected);

  router.post('/queue/create', entitiesHandler.queueCreate);
  router.post('/queue/mutate', entitiesHandler.queueMutate);

  router.post('/reset', entitiesHandler.reset);

  return router;
}