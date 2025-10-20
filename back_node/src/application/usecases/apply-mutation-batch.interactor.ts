import { type MutationBufferPort } from '@/application/ports/batch-queues';
import { type SelectionRepository } from '@/application/ports/selection.repository';

export type ApplyMutationBatchResult = { applied: true };

export class ApplyMutationBatchInteractor {
  constructor(
    private readonly buffer: MutationBufferPort,
    private readonly selectionRepo: SelectionRepository,
  ) {}

  execute(): ApplyMutationBatchResult {
    return { applied: true };
  }
}