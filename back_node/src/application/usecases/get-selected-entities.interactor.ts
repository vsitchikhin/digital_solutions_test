import { type SelectionRepository } from '@/application/ports/selection.repository';
import { type GetSelectedEntitiesRequest, type GetSelectedEntitiesResponse } from '@/application/dto/entities.dto';

export class GetSelectedEntitiesInteractor {
  private readonly DEFAULT_LIMIT = Number(process.env.DEFAULT_ENTITIES_LIMIT) || 20;
  private readonly MAX_LIMIT = Number(process.env.MAX_ENTITIES_LIMIT) || 100;

  constructor(private readonly selectionRepo: SelectionRepository) {}

  execute(req: GetSelectedEntitiesRequest): GetSelectedEntitiesResponse {
    const order = this.selectionRepo.getOrder();
    const total = order.length;

    if (typeof req.q === 'number' && Number.isFinite(req.q) && req.q > 0) {
      const id = Math.floor(req.q);
      const found = order.includes(id);
      return { items: found ? [id] : [], nextCursor: undefined, total };
    }

    const limit = this.normalizeLimit(req.limit);
    const from = this.normalizeCursor(req.cursor, total);
    const to = Math.min(from + limit, total);

    const items = order.slice(from, to);
    const nextCursor = to < total ? to : undefined;

    return {
      items,
      nextCursor,
      total,
    };
  }

  private normalizeLimit(value: unknown): number {
    const raw = typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : this.DEFAULT_LIMIT;
    if (raw < 1) return 1;
    if (raw >= this.MAX_LIMIT) return this.MAX_LIMIT;
    return raw;
  }

  private normalizeCursor(value: unknown, total: number): number {
    const raw = typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : 0;
    if (raw < 0) return 0;
    if (raw >= total) return total;
    return raw;
  };
}