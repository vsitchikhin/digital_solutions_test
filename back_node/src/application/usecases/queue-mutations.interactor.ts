import { type MutationBufferPort } from '@/application/ports/batch-queues';
import { type QueueMutationsRequest, type QueueMutationsResponse } from '@/application/dto/mutations.dto';

export class QueueMutationsInteractor {
  constructor(private readonly mutationBuffer: MutationBufferPort) {}

  execute(req: QueueMutationsRequest): QueueMutationsResponse {
    const batchId = this.mutationBuffer.enqueue(req);
    return { batchId, queued: true };
  }
}