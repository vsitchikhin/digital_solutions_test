import { type MutationPayload } from '@/application/ports/batch-queues';
import { type ItemId } from '@/application/types/primitives';

export type QueueAddItemsRequest = {
  ids?: ItemId[];
}

export type QueueAddItemsEnqueueResponse = {
  batchId: string;
  queued: true;
}

export type QueueMutationsRequest = MutationPayload

export type QueueMutationsResponse = QueueAddItemsEnqueueResponse