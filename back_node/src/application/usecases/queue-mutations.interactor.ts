import { type MutationBufferPort } from '@/application/ports/batch-queues';
import { type QueueMutationsRequest, type QueueMutationsResponse } from '@/application/dto/mutations.dto';
import { RequestLogLevelEnum, writeLogLine } from '@/infrastructure/http/middleware/request-logger.middleware';
import { InternalServerError } from '@/infrastructure/http/errors/http.errors';
import { type ItemId } from '@/application/types/primitives';

export class QueueMutationsInteractor {
  constructor(private readonly mutationBuffer: MutationBufferPort) {}

  execute(req: QueueMutationsRequest): QueueMutationsResponse {
    try {
      const select = this.normalizeIds(req.select);
      const unselect = this.normalizeIds(req.unselect);

      let beforeId: ItemId | undefined;
      let afterId: ItemId | undefined;
      let movedId: ItemId | undefined;

      if (req.reorder && Number.isInteger(req.reorder.movedId) && req.reorder.movedId > 0) {
        movedId = req.reorder.movedId;
        const beforeOk =
          typeof req.reorder.beforeId === 'number' &&
          Number.isInteger(req.reorder.beforeId) &&
          req.reorder.beforeId > 0;

        const afterOk =
          typeof req.reorder.afterId === 'number' &&
        Number.isInteger(req.reorder.afterId) &&
        req.reorder.afterId > 0;

        if (beforeOk && !afterOk) beforeId = req.reorder.beforeId as ItemId;
        else if (!beforeOk && afterOk) afterId = req.reorder.afterId as ItemId;
      }

      const batchId = this.mutationBuffer.enqueue({
        select: select.length ? select : undefined,
        unselect: unselect.length ? unselect : undefined,
        reorder: movedId !== undefined ? { movedId, beforeId, afterId } : undefined,
      });

      return { batchId, queued: true };
    } catch(err: unknown) {
      void writeLogLine({
        level: RequestLogLevelEnum.error,
        line: '[queue-mutations] failed while enqueuing payload',
        error: err,
      });
      throw new InternalServerError('QueueMutations failed', {
        where: 'QueueMutationsInteractor.execute',
        input: req,
      });
    }
  }

  private normalizeIds(list: unknown): ItemId[] {
    if (!Array.isArray(list)) return [];
    const out: ItemId[] = [];
    const seen = new Set<ItemId>();
    list.forEach((id) => {
      if (!seen.has(id)) {
        seen.add(id);
        out.push(id);
      }
    });
    return out;
  }
}