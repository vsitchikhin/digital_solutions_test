import express, { type Express, json } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import useEntitiesRouter from '@/infrastructure/http/routes/entities.routes';
import { errorHandler } from '@/infrastructure/http/middleware/error-handler.middleware';
import {
  requestLogger,
  RequestLogLevelEnum,
  writeLogLine,
} from '@/infrastructure/http/middleware/request-logger.middleware';
import { GetEntitiesListInteractor } from '@/application/usecases/get-entities-list.interactor';
import { InMemoryUniverseRepository } from '@/infrastructure/repositories/in-memory-universe.repository';
import { InMemorySelectionRepository } from '@/infrastructure/repositories/in-memory-selection.repository';
import { GetSelectedEntitiesInteractor } from '@/application/usecases/get-selected-entities.interactor';
import { QueueAddItemsInteractor } from '@/application/usecases/queue-add-items.interactor';
import { QueueMutationsInteractor } from '@/application/usecases/queue-mutations.interactor';
import { EntitiesHandler } from '@/infrastructure/http/handlers/entities.handler';
import { InMemoryCreateBuffer } from '@/infrastructure/queue/create.buffer';
import { InMemoryMutationBuffer } from '@/infrastructure/queue/mutation.buffer';
import { IntervalScheduler } from '@/infrastructure/schedulers/interval.scheduler';
import { ApplyCreateBatchInteractor } from '@/application/usecases/apply-create-batch.interactor';
import { ApplyMutationBatchInteractor } from '@/application/usecases/apply-mutation-batch.interactor';

export default async function bootstrap(): Promise<void> {
  try {
    dotenv.config();

    const selectionRepo = new InMemorySelectionRepository();
    const universeRepo = new InMemoryUniverseRepository();

    const createBuffer = new InMemoryCreateBuffer();
    const mutationBuffer = new InMemoryMutationBuffer();

    const getListUC = new GetEntitiesListInteractor(selectionRepo, universeRepo);
    const getSelectedUC = new GetSelectedEntitiesInteractor(selectionRepo);

    const queueAddUC = new QueueAddItemsInteractor({
      enqueue: (_ids) => 'batch-create-not-implemented',
      flush: () => ({ ids: [] }),
    });
    const queueMutationsUC = new QueueMutationsInteractor({
      enqueue: (_ids) => 'batch-mutation-not-implemented',
      flush: () => ({ select: [], unselect: [] }),
    });

    const applyCreateUC = new ApplyCreateBatchInteractor(createBuffer, universeRepo);
    const applyMutationUC = new ApplyMutationBatchInteractor(mutationBuffer, selectionRepo);

    const scheduler = new IntervalScheduler();

    const entitiesHandler = new EntitiesHandler(
      getListUC,
      getSelectedUC,
      queueAddUC,
      queueMutationsUC,
    );

    const createTask = scheduler.every(Number(process.env.ADD_ELEMENTS_SCHEDULE) || 10_000, () => {
      try {
        const result = applyCreateUC.execute();
        if ('empty' in result) return;

        void writeLogLine({
          level: RequestLogLevelEnum.info,
          line: `[batch:create] accepted=${result.accepted.length} rejected=${result.rejected.length}`,
        });
      } catch (err: unknown) {
        void writeLogLine({
          level: RequestLogLevelEnum.error,
          line: '[batch:create] failed',
          error: err,
        });
      }
    });

    const mutateTask = scheduler.every(Number(process.env.UPDATE_ELEMENTS_SCHEDULE) || 1_000, () => {
      try {
        const result = applyMutationUC.execute();
        if ('empty' in result) return;

        void writeLogLine({
          level: RequestLogLevelEnum.info,
          line: `[batch:mutation] selected=${result.counts.selected} unselected=${result.counts.unselected} reordered=${result.counts.reordered}`,
        });
      } catch(err: unknown) {
        void writeLogLine({
          level: RequestLogLevelEnum.error,
          line: '[batch:update] failed',
          error: err,
        });
      }
    });

    const app: Express = express();

    app.use(cors());
    app.use(json());

    app.use(requestLogger);

    app.use('/api/entities', useEntitiesRouter(entitiesHandler));
    app.use(errorHandler);

    function shutdown(): void {
      createTask.stop();
      mutateTask.stop();

      console.log('Scheduler stopped. Shutting down...');
      writeLogLine({
        level: RequestLogLevelEnum.info,
        line: 'Scheduler stopped. Shutting down...',
      });
      process.exit(0);
    }

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`⚡️ [server]: Server is running at http://localhost:${PORT || 4000}`);
    });
  } catch(err: unknown) {
    console.error('[bootstrap] Failed to start application:', err);
    writeLogLine({
      level: RequestLogLevelEnum.error,
      line: '[bootstrap] Failed to start application:',
      error: err,
    });
    process.exit(1);
  }
};