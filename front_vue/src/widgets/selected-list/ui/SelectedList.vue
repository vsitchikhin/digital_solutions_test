<template>
  <q-card>
    <q-card-section class="text-h6">
      Выбранные
    </q-card-section>
    <q-separator />
    <q-card-section class="q-pa-none">
      <div v-if="!list.length && !loading" class="q-pa-md text-grey">Пусто</div>

      <q-list v-else>
        <draggable
          v-model="list"
          :item-key="getKey"
          handle=".drag-handle"
          :disabled="loading"
          @end="onEnd"
        >
          <template #item="{ element: id }">
            <q-item :key="`sel-${id}`" dense>
              <q-item-section side>
                <q-icon name="drag_indicator" class="drag-handle cursor-pointer q-pr-sm" />
              </q-item-section>
              <q-item-section>{{ id }}</q-item-section>
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
import { defineComponent, type PropType, ref, watch } from 'vue';
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
    unselect: (id: EntityId) => Number.isInteger(id) && id > 0,
    reorder: (params: ReorderPayload) =>
      Number.isInteger(params.movedId) && params.movedId > 0,
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
      const newIndex: EntityId = event?.newIndex;
      if (typeof newIndex !== 'number' || newIndex < 0 || newIndex >= list.value.length) return;

      const movedId: EntityId = list.value[newIndex] as EntityId;
      const beforeId: EntityId | undefined = newIndex > 0 ? list.value[newIndex - 1] : undefined;
      const afterId: EntityId | undefined = newIndex < list.value.length - 1 ? list.value[newIndex + 1] : undefined;

      emit('reorder', { movedId, beforeId, afterId });
    }


    return {
      list,

      getKey,
      onUnselect,
      onEnd,
    };
  },
});
</script>

<style scoped>
.disabled { opacity: 0.6; pointer-events: none; }
</style>
