<template>
  <q-card>
    <q-card-section class="text-h6">
      Доступные элементы
    </q-card-section>
    <q-separator />
    <q-card-section class="q-pa-none">
      <div v-if="!items.length && !loading" class="q-pa-md text-grey">Нет данных</div>

      <q-list v-else>
        <draggable
          v-model="list"
          :item-key="getKey"
          handle=".drag-handle"
          :disabled="loading"
          @end="onEnd"
        >
          <template #item="{ element: id }">
            <q-item :key="id" dense :class="loading ? 'disabled' : ''">
              <q-item-section side>
                <q-icon name="drag_indicator" class="drag-handle cursor-pointer q-pr-sm" />
              </q-item-section>
              <q-item-section>{{ id }}</q-item-section>
              <q-item-section side>
                <q-btn
                  size="sm"
                  color="primary"
                  flat
                  label="Выбрать"
                  :disable="loading"
                  @click="onSelect(id)"
                />
              </q-item-section>
            </q-item>
          </template>
        </draggable>

        <q-item v-if="loading" dense>
          <q-item-section>Загрузка…</q-item-section>
        </q-item>

        <q-item v-else-if="hasMore" clickable dense @click="onLoadMore">
          <q-item-section class="text-primary">
            Загрузить ещё
          </q-item-section>
        </q-item>
      </q-list>

      <div ref="sentinel" style="height: 1px;" />
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, type PropType, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { throttle } from '@/shared/lib/time';
import type { EntityId } from '@/shared/types/primitives';
import draggable from 'vuedraggable';
import type { ReorderPayload } from '@/entities/entity/model/dto';

export default defineComponent({
  components: { draggable },
  props: {
    items: {
      type: Array as PropType<EntityId[]>,
      required: true,
    },
    loading: {
      type: Boolean,
      default: () => false,
    },
    hasMore: {
      type: Boolean,
      default: () => false,
    },
  },

  emits: {
    select: (id: EntityId) => Number.isInteger(id) && id > 0,
    loadMore: () => true,
    reorder: (params: ReorderPayload) =>
      Number.isInteger(params.movedId) && params.movedId > 0,
  },

  setup(props, { emit }) {
    const sentinel = ref<HTMLElement | null>(null);
    let observer: IntersectionObserver | null = null;

    const emitLoadMore = throttle(() => {
      if (!props.loading && props.hasMore) {
        emit('loadMore');
      }
    }, 200);

    function onSelect(id: number) {
      emit('select', id);
    }
    function onLoadMore() {
      emitLoadMore();
    }

    function setupObserver() {
      teardownObserver();
      if (!sentinel.value) return;

      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            emitLoadMore();
          }
        }
      }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      });

      observer.observe(sentinel.value);
    }

    function teardownObserver() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }

    onMounted(() => {
      setupObserver();
      if (props.hasMore && !props.loading) {
        requestAnimationFrame(() => emitLoadMore());
      }
    });

    onBeforeUnmount(() => {
      teardownObserver();
    });

    watch(() => [props.loading, props.hasMore], () => {
      if (sentinel.value && !observer) setupObserver();
    });

    const list = ref<EntityId[]>([...props.items]);
    watch(() => props.items, value => { list.value = [...value]; }, { deep: false });

    function getKey(id: EntityId) { return id; }

    function onEnd(event: any) {
      if (props.loading) return;
      const newIdx = Number(event?.newIndex);
      if (!Number.isInteger(newIdx) || newIdx < 0 || newIdx >= list.value.length) return;

      const movedId: EntityId = list.value[newIdx] as EntityId;
      const beforeId: EntityId | undefined = newIdx > 0 ? (list.value[newIdx - 1] as EntityId) : undefined;
      const afterId: EntityId | undefined =
        newIdx < list.value.length - 1 ? (list.value[newIdx + 1] as EntityId) : undefined;

      const payload: ReorderPayload = { movedId, beforeId, afterId };
      emit('reorder', payload);
    }

    return {
      sentinel,
      onSelect,
      onLoadMore,

      list,
      getKey,
      onEnd,
    };
  },
});
</script>

<style scoped lang="scss">
.disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>

