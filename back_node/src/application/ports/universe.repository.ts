import { type ItemId } from '@/application/types/primitives';

export interface UniverseRepository {
  exists(id: ItemId): boolean;
  add(ids: ItemId[]): {
    accepted: ItemId[];
    rejected: Array<{ id: ItemId, reason: string }>;
  };
  getExtraIdsSorted(): ItemId[];
}