import express, { type Express, json } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import useEntitiesRouter from '@/infrastructure/http/routes/entities.routes';
import { errorHandler } from '@/infrastructure/http/middleware/error-handler.middleware';
import { requestLogger } from '@/infrastructure/http/middleware/request-logger.middleware';
import { GetEntitiesListInteractor } from '@/application/usecases/get-entities-list.interactor';
import { InMemoryUniverseRepository } from '@/infrastructure/repositories/in-memory-universe.repository';
import { InMemorySelectionRepository } from '@/infrastructure/repositories/in-memory-selection.repository';
import { GetSelectedEntitiesInteractor } from '@/application/usecases/get-selected-entities.interactor';
import { QueueAddItemsInteractor } from '@/application/usecases/queue-add-items.interactor';
import { QueueMutationsInteractor } from '@/application/usecases/queue-mutations.interactor';
import { EntitiesHandler } from '@/infrastructure/http/handlers/entities.handler';

dotenv.config();

const selectionRepo = new InMemorySelectionRepository();
const universeRepo = new InMemoryUniverseRepository();

const getListUC: GetEntitiesListInteractor = new GetEntitiesListInteractor(selectionRepo, universeRepo);
const getSelectedUC: GetSelectedEntitiesInteractor = new GetSelectedEntitiesInteractor(selectionRepo);
const queueAddUC: QueueAddItemsInteractor = new QueueAddItemsInteractor({
  enqueue: (_ids) => 'batch-create-not-implemented',
  flush: () => ({ ids: [] }),
});
const queueMutationsUC: QueueMutationsInteractor = new QueueMutationsInteractor({
  enqueue: (_ids) => 'batch-mutation-not-implemented',
  flush: () => ({ select: [], unselect: [] }),
});

const entitiesHandler = new EntitiesHandler(
  getListUC,
  getSelectedUC,
  queueAddUC,
  queueMutationsUC,
);

export const app: Express = express();

app.use(cors());
app.use(json());

app.use(requestLogger);

app.use('/api/entities', useEntitiesRouter(entitiesHandler));
app.use(errorHandler);