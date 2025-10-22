<template>
  <q-card flat bordered>
    <q-card-section class="row items-center q-col-gutter-sm">
      <div class="col">
        <q-input
          v-model.number="searchValue"
          type="number"
          dense
          outlined
          label="Поиск по ID"
          :disable="busy"
          clearable
          @keyup.enter="emitSearch"
        >
          <template #append>
            <q-btn
              dense
              flat
              icon="search"
              :loading="busy"
              :disable="busy"
              @click="emitSearch"
            />
          </template>
        </q-input>
      </div>
      <div class="col-auto">
        <q-btn
          label="Обновить"
          color="primary"
          flat
          :loading="busy"
          :disable="busy"
          @click="onRefresh"
        />
      </div>
      <div class="col-auto">
        <q-btn
          label="Сбросить"
          color="negative"
          flat
          :loading="busy"
          :disable="busy"
          @click="onReset"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import type { EntityId } from '@/shared/types/primitives';

export default defineComponent({
  props: {
    busy: {
      type: Boolean,
      default: undefined,
    },
  },

  emits: {
    reset: () => true,
    refresh: () => true,
    search: (payload: { query: EntityId }) => Number.isFinite(payload.query),
  },

  setup(_, { emit }) {
    const searchValue = ref<number | null>(null);
    function emitSearch() {
      if (searchValue.value != null && Number.isFinite(searchValue.value)) {
        emit('search', { query: searchValue.value });
      }
    }

    function onReset() {
      searchValue.value = null;
      emit('reset');
    }
    function onRefresh() {
      emit('refresh');
    }

    return {
      searchValue,
      emitSearch,

      onReset,
      onRefresh,
    };
  },
});
</script>
