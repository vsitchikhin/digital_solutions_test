import { type CreateBufferPort } from '@/application/ports/batch-queues';
import { type ItemId } from '@/application/types/primitives';
import { randomUUID } from 'node:crypto';

export class InMemoryCreateBuffer implements CreateBufferPort {
  private readonly pending = new Set<ItemId>();

  enqueue(ids: ItemId[]): string {
    if (Array.isArray(ids)) {
      ids.forEach((id) => {
        if (Number.isInteger(id) && id > 0) this.pending.add(id);
      });
    }
    return randomUUID();
  }

  flush(): { ids: ItemId[] } {
    if (this.pending.size === 0) return { ids: [] };
    const ids = Array.from(this.pending).sort((a, b) => a - b);
    this.pending.clear();
    return { ids };
  }
}