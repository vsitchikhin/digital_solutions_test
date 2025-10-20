import { type CreateBufferPort } from '@/application/ports/batch-queues';
import { type QueueAddItemsEnqueueResponse, type QueueAddItemsRequest } from '@/application/dto/mutations.dto';

export class QueueAddItemsInteractor {
  constructor(private readonly createBuffer: CreateBufferPort) {}

  execute(req: QueueAddItemsRequest): QueueAddItemsEnqueueResponse {
    const batchId = this.createBuffer.enqueue(req);
    return { batchId, queued: true };
  }
}