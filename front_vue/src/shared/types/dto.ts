import type { BatchId, EntityId } from '@/shared/types/primitives';

export type ListResponse = {
  items: EntityId[];
  nextCursor: EntityId;
};

export type QueueResponse = {
  batchId: BatchId;
  queued: boolean;
};