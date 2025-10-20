import { type ItemId } from '@/application/types/primitives';

export type ReorderPayload = {
  movedId: ItemId;
  beforeId?: ItemId;
  afterId?: ItemId;
}

export type MutationPayload = {
  select?: ItemId[];
  unselect?: ItemId[];
  reorder?: ReorderPayload;
}

export interface CreateBufferPort {
  enqueue(ids: ItemId[]): string;
  flush(): { ids: ItemId[] };
}

export interface MutationBufferPort {
  enqueue(payload: MutationPayload): string;
  flush(): {
    select: ItemId[];
    unselect: ItemId[];
    reorder?: ReorderPayload;
  }
}