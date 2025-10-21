import { type SelectionRepository } from '@/application/ports/selection.repository';
import { type ItemId } from '@/application/types/primitives';

export class InMemorySelectionRepository implements SelectionRepository {
  private readonly selectedSet = new Set<ItemId>();
  private selectedOrder: ItemId[] = [];

  isSelected(id: ItemId): boolean {
    return this.selectedSet.has(id);
  }

  select(ids: ItemId[]): void {
    if (!Array.isArray(ids) || ids.length === 0) return;

    ids.forEach((id) => {
      if (!Number.isInteger(id) || id <= 0) return;
      if (!this.selectedSet.has(id)) {
        this.selectedSet.add(id);
        this.selectedOrder.push(id);
      }
    });
  }

  unselect(ids: ItemId[]): void {
    if (!Array.isArray(ids) || ids.length === 0) return;

    let changed = false;
    ids.forEach((id) => {
      if (this.selectedSet.delete(id)) {
        changed = true;
      }
    });

    if (changed) {
      const toRemove = new Set(ids);
      this.selectedOrder = this.selectedOrder.filter((id) => !toRemove.has(id));
    }
  }

  getOrder(): ItemId[] {
    return this.selectedOrder.slice();
  }

  setOrder(ids: ItemId[]): void {
    const unique: ItemId[] = [];
    const seen = new Set<ItemId>();

    ids.forEach((id) => {
      if (!Number.isInteger(id) || id <= 0) return;
      if (!seen.has(id)) {
        seen.add(id);
        unique.push(id);
      }
    });

    this.selectedOrder = unique;
    this.selectedSet.clear();
    unique.forEach((id) => this.selectedSet.add(id));
  }

  countSelected(): number {
    return this.selectedSet.size;
  }

  clear(): void {
    this.selectedSet.clear();
    this.selectedOrder = [];
  }
}