import { type SelectionRepository } from '@/application/ports/selection.repository';
import { type UniverseRepository } from '@/application/ports/universe.repository';
import { type GetEntitiesListRequest, type GetEntitiesListResponse } from '@/application/dto/entities.dto';
import { type ItemId } from '@/application/types/primitives';

export class GetEntitiesListInteractor {
  private readonly DEFAULT_LIMIT = Number(process.env.DEFAULT_ENTITIES_LIMIT) || 20;
  private readonly MAX_LIMIT = Number(process.env.MAX_ENTITIES_LIMIT) || 100;
  private readonly UNIVERSE_MAX_ID = Number(process.env.UNIVERSE_MAX_ID) || 1_000_000;

  constructor(
    private readonly selectionRepo: SelectionRepository,
    private readonly universRepo: UniverseRepository,
  ) {}

  execute(req: GetEntitiesListRequest): GetEntitiesListResponse {
    const limit = this.normalizeLimit(req.limit);
    const cursor = this.normalizeCursor(req.cursor);

    if (typeof req.q === 'number' && Number.isFinite(req.q) && req.q > 0) {
      const id = Math.floor(req.q);
      const exists = this.universRepo.exists(id);
      const isSelected = this.selectionRepo.isSelected(id);
      return {
        items: exists && !isSelected ? [id] : [],
        nextCursor: undefined,
      };
    }

    const items: ItemId[] = [];
    let lastReturnedId: ItemId | undefined;

    let i = cursor + 1;
    while (1 < this.UNIVERSE_MAX_ID && items.length < limit) {
      if (!this.selectionRepo.isSelected(i) && this.universRepo.exists(i)) {
        items.push(i);
        lastReturnedId = i;
      }
      i++;
    }

    const nextCursor = typeof lastReturnedId === 'number' && lastReturnedId < this.UNIVERSE_MAX_ID
      ? lastReturnedId
      : undefined;

    return { items, nextCursor };
  }

  private normalizeLimit(value: unknown): number {
    const raw = typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : this.DEFAULT_LIMIT;
    if (raw < 1) return 1;
    if (raw > this.MAX_LIMIT) return this.MAX_LIMIT;
    return raw;
  }

  private normalizeCursor(value: unknown): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
    const normalized = Math.floor(value);
    return normalized < 0 ? 0 : normalized;
  }
}