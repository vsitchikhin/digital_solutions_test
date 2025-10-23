<template>
  <q-card>
    <q-card-section class="text-h6 text-dark">
      Выбранные
    </q-card-section>
    <q-separator />
    <q-card-section class="q-pa-none">
      <div v-if="!list.length && !loading" class="q-pa-md text-grey">Пусто</div>

      <q-list v-else>
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
            <q-item :key="`sel-${id}`" dense :class="loading ? 'disabled' : ''">
              <q-item-section class="text-dark">
                {{ id }}
              </q-item-section>
              <q-item-section side>
                <q-btn
                  size="sm"
                  color="negative"
                  flat
                  label="Убрать"
                  :disable="loading"
                  @click="onUnselect(id)"
                />
              </q-item-section>
            </q-item>
          </template>
        </draggable>

        <q-item v-if="loading" dense>
          <q-item-section>Загрузка…</q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, nextTick, type PropType, ref, watch } from 'vue';
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
  },

  emits: {
    select: (id: EntityId) => Number.isInteger(id) && id > 0,
    unselect: (id: EntityId) => Number.isInteger(id) && id > 0,
    reorder: (params: ReorderPayload) =>
      Number.isInteger(params.movedId) && params.movedId > 0,
    'cross-drop': (params: ReorderPayload) =>
      Number.isInteger(params?.movedId) && params.movedId > 0,
  },

  setup(props, { emit }) {
    const list = ref<EntityId[]>([...props.items]);

    watch(
      () => props.items,
      value => {list.value = [...value];},
      { deep: false },
    );

    function onUnselect(id: EntityId) {
      emit('unselect', id);
    }

    function getKey(id: EntityId) {
      return id;
    }

    function onEnd(event: any) {
      if (props.loading) return;
      if (event?.from !== event?.to) return;

      const newIndex = Number(event?.newIndex);
      if (!Number.isInteger(newIndex) || newIndex < 0 || newIndex >= list.value.length) return;

      const movedId = list.value[newIndex] as EntityId;
      const beforeId = newIndex > 0 ? (list.value[newIndex - 1] as EntityId) : undefined;
      const afterId  = newIndex < list.value.length - 1 ? (list.value[newIndex + 1] as EntityId) : undefined;

      const payload: ReorderPayload =
        typeof beforeId === 'number' ? { movedId, beforeId }
          : typeof afterId  === 'number' ? { movedId, afterId }
            : { movedId };

      emit('reorder', payload);
    }

    async function onChange(event: any) {
      if (event?.added && typeof event.added.element === 'number') {
        await nextTick();

        const nextIndex = Number(event.added.newIndex);
        const id = event.added.element as EntityId;

        const beforeId = nextIndex > 0 ? (list.value[nextIndex - 1] as EntityId) : undefined;
        const afterId  = nextIndex < list.value.length - 1 ? (list.value[nextIndex + 1] as EntityId) : undefined;

        const payload: ReorderPayload =
          typeof beforeId === 'number' ? { movedId: id, beforeId }
            : typeof afterId  === 'number' ? { movedId: id, afterId }
              : { movedId: id };

        emit('cross-drop', payload);
      }
    }

    return {
      list,

      getKey,
      onUnselect,
      onEnd,

      onChange,
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
