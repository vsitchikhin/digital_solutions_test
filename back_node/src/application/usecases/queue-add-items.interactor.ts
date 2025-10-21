import { type CreateBufferPort } from '@/application/ports/batch-queues';
import { type QueueAddItemsEnqueueResponse, type QueueAddItemsRequest } from '@/application/dto/mutations.dto';
import { type UniverseRepository } from '@/application/ports/universe.repository';
import { type ItemId } from '@/application/types/primitives';
import { InternalServerError } from '@/infrastructure/http/errors/http.errors';
import { RequestLogLevelEnum, writeLogLine } from '@/infrastructure/http/middleware/request-logger.middleware';

export class QueueAddItemsInteractor {
  constructor(
    private readonly createBuffer: CreateBufferPort,
    private readonly universeRepo: UniverseRepository,
  ) {}

  execute(req: QueueAddItemsRequest): QueueAddItemsEnqueueResponse {
    try {
      const raw = Array.isArray(req.ids) ? req.ids : [];

      const unique = new Set<ItemId>();
      raw.forEach((id: ItemId) => {
        if (Number.isInteger(id) && id > 0) unique.add(id);
      });

      const candidates: ItemId[] = [];
      unique.forEach((id) => {
        if (!this.universeRepo.exists(id)) candidates.push(id);
      });

      const batchId = this.createBuffer.enqueue(candidates);

      return { batchId, queued: true };
    } catch(err: unknown) {
      void writeLogLine({
        level: RequestLogLevelEnum.error,
        line: '[queue-add-items] failed while enqueuing ids',
        error: err,
      });
      throw new InternalServerError('QueueAddItems failed', { where: 'QueueAddItemsInteractor.execute', input: req });
    }
  }
}