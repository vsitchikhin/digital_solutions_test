import { type MutationBufferPort } from '@/application/ports/batch-queues';
import { type SelectionRepository } from '@/application/ports/selection.repository';
import { type SelectionOrderService } from '@/domain/selection/selection-order.service';
import { RequestLogLevelEnum, writeLogLine } from '@/infrastructure/http/middleware/request-logger.middleware';

export type ApplyMutationBatchResult = {
  applied: true;
  counts: {
    selected: number;
    unselected: number;
    reordered: boolean;
  }
} | { empty: true };

export class ApplyMutationBatchInteractor {
  constructor(
    private readonly buffer: MutationBufferPort,
    private readonly selectionRepo: SelectionRepository,
    private readonly orderService: SelectionOrderService,
  ) {}

  execute(): ApplyMutationBatchResult {
    const { select, unselect, reorder } = this.buffer.flush();
    if (select.length === 0 && unselect.length === 0 && !reorder) return { empty: true };

    if (select.length) this.selectionRepo.select(select);
    if (unselect.length) this.selectionRepo.unselect(unselect);

    let reordered = false;

    if (reorder) {
      try {
        const order = this.selectionRepo.getOrder();
        const updated = this.orderService.reorder(order, reorder.movedId, reorder.beforeId, reorder.afterId);

        if (!this.arraysEqual(order, updated)) {
          this.selectionRepo.setOrder(updated);
          reordered = true;
        }
      } catch(err: unknown) {
        void writeLogLine({
          level: RequestLogLevelEnum.error,
          line: `[batch:mutation] reorder failed for movedId=${reorder.movedId} before=${String(
            reorder.beforeId,
          )} after=${String(reorder.afterId)}`,
          error: err,
        });
      }
    }

    return {
      applied: true,
      counts: {
        selected: select.length,
        unselected: unselect.length,
        reordered,
      },
    };

  }

  arraysEqual(a: number[], b: number[]): boolean {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
}