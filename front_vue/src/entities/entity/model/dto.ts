import type { ListResponse as SharedListResponse, QueueResponse as SharedQueueResponse } from '@/shared/types/dto';
import type { Cursor, EntityId } from '@/shared/types/primitives';

export type GetListParams = {
  cursor?: Cursor | undefined;
  limit?: number | undefined;
  q?: string | undefined;
}

export type GetSelectedParams = GetListParams;

export type QueueCreateBody = {
  ids: EntityId[];
}

export type ReorderPayload = {
  movedId: EntityId;
  beforeId?: EntityId | undefined;
  afterId?: EntityId | undefined;
}

export type QueueMutateBody = {
  select?: EntityId[];
  unselect?: EntityId[];
  reorder?: ReorderPayload;
}

export type ListResponse = SharedListResponse;
export type QueueResponse = SharedQueueResponse;