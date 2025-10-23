import type { Cursor, EntityId } from '@/shared/types/primitives';
import { defineStore } from 'pinia';
import * as entitiesApi from '@/entities/entity/lib/api';
import type { GetListParams, QueueMutateBody, ReorderPayload } from '@/entities/entity/model/dto';
import { getDefaultLimit, normalizeLimit } from '@/shared/config/limits';
import { uniqPreserveOrder } from '@/entities/entity/model/selectors';

type LoadingFlags = {
  unselected: boolean;
  selected: boolean;
  mutate: boolean;
}

type State = {
  unselected: EntityId[];
  selected: EntityId[];
  unselectedCursor: Cursor | null;
  selectedCursor: Cursor | null;
  loading: LoadingFlags;
  error: string | null;
}

export const useEntityStore = defineStore('entity', {
  state: (): State => ({
    unselected: [],
    selected: [],
    unselectedCursor: null,
    selectedCursor: null,
    loading: {
      unselected: false,
      selected: false,
      mutate: false,
    },
    error: null,
  }),

  getters: {
    hasMoreAvailable: (state): boolean => typeof state.unselectedCursor === 'number',
    isEmptyList: (state): boolean => state.unselected.length === 0,
    isEmptySelected: (state): boolean => state.selected.length === 0,
  },

  actions: {
    async loadAvailable(params?: GetListParams): Promise<void> {
      this.loading.unselected = true;
      this.clearError();
      try {
        const limit = normalizeLimit(params?.limit) ?? getDefaultLimit() ?? 20;
        const response = await entitiesApi.list({
          cursor: params?.cursor || this.unselectedCursor || undefined,
          limit,
          q: params?.q,
        });
        this.unselected = uniqPreserveOrder([...this.unselected, ...response.items]);
        this.unselectedCursor = typeof response.nextCursor === 'number' ? response.nextCursor : null;
      } catch (e) {
        this.setError(e instanceof Error ? e.message : 'Failed to load unselected');
      } finally {
        this.loading.unselected = false;
      }
    },

    async loadSelected(params?: GetListParams): Promise<void> {
      this.loading.selected = true;
      this.clearError();
      try {
        const limit = normalizeLimit(params?.limit) ?? getDefaultLimit() ?? 20;
        const resp = await entitiesApi.selectedList({
          cursor: params?.cursor || this.selectedCursor || undefined,
          limit,
          q: params?.q,
        });
        this.selected = uniqPreserveOrder([...this.selected, ...resp.items]);
        this.selectedCursor = typeof resp.nextCursor === 'number' ? resp.nextCursor : null;
      } catch (e) {
        this.setError(e instanceof Error ? e.message : 'Failed to load selected');
      } finally {
        this.loading.selected = false;
      }
    },

    async enqueueCreate(ids: EntityId[]): Promise<void> {
      this.loading.mutate = true;
      this.clearError();
      try {
        if (!Array.isArray(ids) || ids.length === 0) return;
        await entitiesApi.queueCreate({ ids });
        await this.refresh();
      } catch (e) {
        this.setError(e instanceof Error ? e.message : 'Failed to enqueue create');
      } finally {
        this.loading.mutate = false;
      }
    },

    async enqueueMutations(payload: QueueMutateBody): Promise<void> {
      this.loading.mutate = true;
      this.clearError();

      const snap = {
        unselected: [...this.unselected],
        selected: [...this.selected],
        unselectedCursor: this.unselectedCursor,
        selectedCursor: this.selectedCursor,
      };

      try {
        const normReorder = toQueueReorder(payload.reorder);

        if (Array.isArray(payload.select) && payload.select.length) {
          const selectIds = payload.select;
          for (const id of selectIds) {
            this.unselected = this.unselected.filter(x => x !== id);

            if (normReorder && normReorder.movedId === id) {
              this.selected = insertWithAnchor(this.selected, id, normReorder.beforeId, normReorder.afterId);
            } else {
              if (!this.selected.includes(id)) this.selected = [...this.selected, id];
            }
          }
        }

        if (Array.isArray(payload.unselect) && payload.unselect.length) {
          for (const id of payload.unselect) {
            this.selected = this.selected.filter(x => x !== id);
            if (!this.unselected.includes(id)) this.unselected = [id, ...this.unselected];
          }
        }

        if (normReorder && !(payload.select?.includes(normReorder.movedId ?? -1))) {
          const { movedId, beforeId, afterId } = normReorder;
          this.selected = reorderInList(this.selected, movedId, beforeId, afterId);
        }

        await entitiesApi.queueMutate({
          select: payload.select,
          unselect: payload.unselect,
          reorder: normReorder,
        });
      } catch (e) {
        this.unselected = snap.unselected;
        this.selected = snap.selected;
        this.unselectedCursor = snap.unselectedCursor;
        this.selectedCursor = snap.selectedCursor;
        this.setError(e instanceof Error ? e.message : 'Failed to enqueue mutations');
      } finally {
        this.loading.mutate = false;
      }
    },

    async resetSelection(): Promise<void> {
      this.loading.mutate = true;
      this.clearError();
      try {
        await entitiesApi.reset();
        await this.refresh();
      } catch (e) {
        this.setError(e instanceof Error ? e.message : 'Failed to reset selection');
      } finally {
        this.loading.mutate = false;
      }
    },

    async refresh(): Promise<void> {
      this.unselected = [];
      this.selected = [];
      this.unselectedCursor = null;
      this.selectedCursor = null;

      const firstLimit = getDefaultLimit() ?? 20;

      await Promise.all([
        this.loadAvailable({ limit: firstLimit }),
        this.loadSelected({ limit: firstLimit }),
      ]);
    },

    setError(msg: string | null): void {
      this.error = msg;
    },
    clearError(): void {
      this.error = null;
    },
    reorderAvailableLocal(params: ReorderPayload): void {
      this.unselected = reorderInList(this.unselected, params.movedId, params.beforeId, params.afterId);
    },
  },
});

function reorderInList(
  list: EntityId[],
  movedId: EntityId,
  beforeId?: EntityId,
  afterId?: EntityId,
): EntityId[] {
  const idx = list.indexOf(movedId);
  if (idx === -1) return list;
  const next = [...list];
  next.splice(idx, 1);

  if (typeof beforeId === 'number') {
    const beforeIdx = next.indexOf(beforeId);
    const insertAt = beforeIdx + 1;
    next.splice(insertAt, 0, movedId);
    return next;
  }
  if (typeof afterId === 'number') {
    const afterIdx = next.indexOf(afterId);
    const insertAt = Math.max(0, afterIdx);
    next.splice(insertAt, 0, movedId);
    return next;
  }

  next.splice(Math.min(idx, next.length), 0, movedId);
  return next;
}

function insertWithAnchor(list: EntityId[], id: EntityId, beforeId?: EntityId, afterId?: EntityId): EntityId[] {
  const without = list.filter(x => x !== id);
  if (typeof beforeId === 'number') {
    const idx = without.indexOf(beforeId);
    const insertAt = idx >= 0 ? idx + 1 : without.length;
    const next = [...without];
    next.splice(insertAt, 0, id);
    return next;
  }
  if (typeof afterId === 'number') {
    const idx = without.indexOf(afterId);
    const insertAt = Math.max(0, idx);
    const next = [...without];
    next.splice(insertAt, 0, id);
    return next;
  }
  return [...without, id];
}

function toQueueReorder(params?: ReorderPayload): ReorderPayload | undefined {
  if (!params) return undefined;
  const out: { movedId: EntityId; beforeId?: EntityId; afterId?: EntityId } = { movedId: params.movedId };
  if (typeof params.beforeId === 'number') out.beforeId = params.beforeId;
  else if (typeof params.afterId === 'number') out.afterId = params.afterId;
  return out;
}
