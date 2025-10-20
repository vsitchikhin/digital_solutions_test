import { type Cursor, type ItemId } from '@/application/types/primitives';

export type GetEntitiesListRequest = {
  cursor?: Cursor;
  limit?: number;
  q?: number;
}

export type GetEntitiesListResponse = {
  items: ItemId[];
  nextCursor?: Cursor;
}

export type GetSelectedEntitiesRequest = GetEntitiesListRequest

export type GetSelectedEntitiesResponse = {
  items: ItemId[];
  nextCursor?: Cursor;
  total: number;
}