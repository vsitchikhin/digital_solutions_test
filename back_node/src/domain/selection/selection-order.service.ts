import { type ItemId } from '@/application/types/primitives';

export class SelectionOrderService {
  reorder(
    current: ItemId[],
    moveId: ItemId,
    beforeId?: ItemId,
    afterId?: ItemId,
  ): ItemId[] {
    if (!Array.isArray(current) || current.length === 0) return current.slice();
    if (!Number.isInteger(moveId) || moveId <= 0) return current.slice();

    const result = current.slice();
    const fromIndex = result.indexOf(moveId);
    if (fromIndex === -1) return result;

    result.splice(fromIndex, 1);

    const hasBefore = typeof beforeId === 'number' && Number.isInteger(beforeId) && beforeId > 0;
    const hasAfter = typeof afterId === 'number' && Number.isInteger(afterId) && afterId > 0;

    if (hasBefore === hasAfter) {
      result.push(moveId);
      return result;
    }

    if (hasBefore) {
      const idx = result.indexOf(beforeId as number);
      if (idx === -1) {
        result.push(moveId);
        return result;
      }

      result.splice(idx, 0, moveId);
      return result;
    }

    const idx = result.indexOf(afterId as number);
    if (idx === -1) {
      result.push(moveId);
      return result;
    }
    result.splice(idx + 1, 0, moveId);
    return result;
  }
}