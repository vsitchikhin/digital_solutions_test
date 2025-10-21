import { type CreateBufferPort } from '@/application/ports/batch-queues';
import { type UniverseRepository } from '@/application/ports/universe.repository';
import { type ItemId } from '@/application/types/primitives';

export type ApplyCreateBatchResult = {
  accepted: ItemId[];
  rejected: Array<{ id: ItemId; reason: string }>;
} | { empty: true };

export class ApplyCreateBatchInteractor {
  constructor(
    private readonly buffer: CreateBufferPort,
    private readonly universeRepo: UniverseRepository,
  ) {}

  execute(): ApplyCreateBatchResult {
    const batch = this.buffer.flush();
    if (!batch.ids.length) return { empty: true };

    const { accepted, rejected } = this.universeRepo.add(batch.ids);
    return { accepted, rejected };
  }
}