import { type ItemId } from '@/application/types/primitives';

export interface SelectionRepository {
  isSelected(id: ItemId): boolean;
  select(ids: ItemId[]): void;
  unselect(ids: ItemId[]): void;
  getOrder(): ItemId[];
  setOrder(ids: ItemId[]): void;
  countSelected(): number;
  clear(): void;
}