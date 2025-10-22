import type { EntityId } from '@/shared/types/primitives';

export function uniqPreserveOrder(list: readonly EntityId[]): EntityId[] {
  const seen = new Set<EntityId>();
  const out: EntityId[] = [];
  list.forEach((id: EntityId) => {
    if (!seen.has(id)) {
      out.push(id);
      seen.add(id);
    }
  });
  return out;
}