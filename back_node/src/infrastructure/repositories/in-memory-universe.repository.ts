import { type UniverseRepository } from '@/application/ports/universe.repository';
import { type ItemId } from '@/application/types/primitives';

export class InMemoryUniverseRepository implements UniverseRepository {
  private readonly BASE_MAX = Number(process.env.UNIVERSE_MAX_ID) || 1_000_000;
  private readonly extraIds = new Set<ItemId>();

  exists(id: ItemId): boolean {
    if (!Number.isInteger(id) || id <= 0) return false;
    return id <= this.BASE_MAX || this.extraIds.has(id);
  }

  add(ids: ItemId[]): {
    accepted: ItemId[];
    rejected: Array<{ id: ItemId, reason: string }>;
  } {
    const accepted: ItemId[] = [];
    const rejected: Array<{ id: ItemId, reason: string }> = [];

    if (!Array.isArray(ids) || ids.length === 0) return { accepted, rejected };

    ids.forEach((id) => {
      if (!Number.isInteger(id) || id <= 0) {
        rejected.push({ id, reason: 'Invalid ID: must be integer greater than 0' });
        return;
      }

      if (id <= this.BASE_MAX) {
        rejected.push({ id, reason: `ID belongs to base range 1..${this.BASE_MAX}` });
        return;
      }

      if (this.extraIds.has(id)) {
        rejected.push({ id, reason: 'Already exists' });
        return;
      }

      this.extraIds.add(id);
      accepted.push(id);
    });

    return { accepted, rejected };
  }

  getExtraIdsSorted(): ItemId[] {
    return Array.from(this.extraIds).sort((a, b) => a - b);
  }
}