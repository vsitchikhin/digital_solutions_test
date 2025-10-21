import { type MutationBufferPort } from '@/application/ports/batch-queues';
import { type SelectionRepository } from '@/application/ports/selection.repository';

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
  ) {}

  execute(): ApplyMutationBatchResult {
    const { select, unselect, reorder } = this.buffer.flush();
    if (select.length === 0 && unselect.length === 0 && !reorder) return { empty: true };

    if (select.length) this.selectionRepo.select(select);
    if (unselect.length) this.selectionRepo.unselect(unselect);

    const reordered = !!reorder;
    return {
      applied: true,
      counts: {
        selected: select.length,
        unselected: unselect.length,
        reordered,
      },
    };

  }
}