<template>
  <q-card>
    <q-card-section class="text-h6 text-dark">
      Доступные элементы
    </q-card-section>
    <q-separator />
    <q-card-section class="q-pa-none">
      <div v-if="!items.length && !loading" class="q-pa-md text-grey">Нет данных</div>

      <div
        ref="scrollRoot"
        class="scroll-area"
        :style="{
          maxHeight: maxHeight,
          overflowY: 'auto'
        }"
      >
        <q-list v-if="items.length">
          <draggable
            v-model="list"
            :item-key="getKey"
            :disabled="loading"
            :group="{ name: 'entities', pull: true, put: true }"
            :animation="150"
            :force-fallback="true"
            @end="onEnd"
            @change="onChange"
          >
            <template #item="{ element: id }">
              <q-item :key="id" dense :class="loading ? 'disabled' : ''">
                <q-item-section class="text-dark">{{ id }}</q-item-section>
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
            <q-item-section class="text-primary">Загрузить ещё</q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <div ref="sentinel" style="height: 1px;" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, type PropType, onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue';
import { sleep, throttle } from '@/shared/lib/time';
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
    maxHeight: {
      type: String,
      default: '60vh',
    },
  },

  emits: {
    select: (id: EntityId) => Number.isInteger(id) && id > 0,
    unselect: (id: EntityId) => Number.isInteger(id) && id > 0,
    loadMore: () => true,
    reorder: (params: ReorderPayload) =>
      Number.isInteger(params.movedId) && params.movedId > 0,
    'cross-drop': (params: ReorderPayload) =>
      Number.isInteger(params?.movedId) && params.movedId > 0,
  },

  setup(props, { emit }) {
    const sentinel = ref<HTMLElement | null>(null);
    let observer: IntersectionObserver | null = null;
    const scrollRoot = ref<HTMLElement | null>(null);

    const emitLoadMore = throttle(() => {
      if (!props.loading && props.hasMore) {
        emit('loadMore');
      }
    }, 200);

    function onSelect(id: EntityId) {
      emit('select', id);
    }
    function onLoadMore() {
      emitLoadMore();
    }

    function setupObserver() {
      teardownObserver();
      if (!sentinel.value) return;

      observer = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) emitLoadMore();
      }, {
        root: scrollRoot.value ?? null,
        rootMargin: '160px 0px',
        threshold: 0.01,
      });

      observer.observe(sentinel.value);
    }


    function teardownObserver() {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }


    onMounted(async () => {
      await nextTick();
      setupObserver();

      let attempts = 0;
      while (
        attempts < 3 &&
        scrollRoot.value &&
        scrollRoot.value.scrollHeight <= scrollRoot.value.clientHeight &&
        props.hasMore &&
        !props.loading
      ) {
        emitLoadMore();
        attempts += 1;
        await sleep(50);
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

      const payload: ReorderPayload =
        typeof beforeId === 'number'
          ? { movedId, beforeId }
          : typeof afterId === 'number'
            ? { movedId, afterId }
            : { movedId };
      emit('reorder', payload);
    }

    function onChange(event: any) {
      if (event?.added && typeof event.added.element === 'number') {
        const newIdx = Number(event.added.newIndex);
        const id = event.added.element as EntityId;

        const beforeId = newIdx > 0 ? (list.value[newIdx - 1] as EntityId) : undefined;
        const afterId  = newIdx < list.value.length - 1 ? (list.value[newIdx + 1] as EntityId) : undefined;

        const payload: ReorderPayload =
          typeof beforeId === 'number' ? { movedId: id, beforeId }
            : typeof afterId  === 'number' ? { movedId: id, afterId }
              : { movedId: id };

        emit('cross-drop', payload);
      }
    }

    return {
      sentinel,
      onSelect,
      onLoadMore,

      list,
      getKey,
      onEnd,

      onChange,

      scrollRoot,
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

