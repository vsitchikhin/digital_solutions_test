import { type MutationBufferPort, type MutationPayload, type ReorderPayload } from '@/application/ports/batch-queues';
import { type ItemId } from '@/application/types/primitives';
import { randomUUID } from 'node:crypto';

export class InMemoryMutationBuffer implements MutationBufferPort {
  private readonly selectedSet = new Set<ItemId>();
  private readonly unselectedSet = new Set<ItemId>();
  private lastReorder: ReorderPayload | undefined;

  enqueue(payload: MutationPayload): string {
    if (Array.isArray(payload.select)) {
      payload.select.forEach((id: ItemId) => {
        if (Number.isInteger(id) && id > 0) {
          this.unselectedSet.delete(id);
          this.selectedSet.add(id);
        }
      });
    }

    if (Array.isArray(payload.unselect)) {
      payload.unselect.forEach((id: ItemId) => {
        if (Number.isInteger(id) && id > 0) {
          this.selectedSet.delete(id);
          this.unselectedSet.add(id);
        }
      });
    }

    const reorder = payload.reorder;
    if (reorder && Number.isInteger(reorder.movedId) && reorder.movedId > 0) {
      const beforeOk = typeof reorder.beforeId === 'number' && Number.isInteger(reorder.beforeId) && reorder.beforeId > 0;
      const afterOk = typeof reorder.afterId === 'number' && Number.isInteger(reorder.afterId) && reorder.afterId > 0;
      if ((beforeOk ? 1 : 0) + (afterOk ? 1 : 0) === 1) {
        this.lastReorder = {
          movedId: reorder.movedId,
          beforeId: beforeOk ? reorder.beforeId : undefined,
          afterId: afterOk ? reorder.afterId : undefined,
        };
      }
    }

    return randomUUID();
  }

  flush(): {
    select: ItemId[];
    unselect: ItemId[];
    reorder?: ReorderPayload
    } {
    const select = Array.from(this.selectedSet);
    const unselect = Array.from(this.unselectedSet);
    const reorder = this.lastReorder;

    this.selectedSet.clear();
    this.unselectedSet.clear();
    this.lastReorder = undefined;

    return { select, unselect, reorder };
  }
}