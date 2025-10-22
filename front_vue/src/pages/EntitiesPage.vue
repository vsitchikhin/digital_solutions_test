<template>
  <q-page class="q-pa-md">
    <q-linear-progress
      v-show="busy"
      indeterminate
      color="primary"
      class="q-mb-md"
      style="height: 3px;"
    />

    <error-banner v-if="errorMessage" :message="errorMessage" @close="onErrorClose" />

    <toolbar-card
      class="q-mb-md"
      :busy="busy"
      @reset="onReset"
      @refresh="onRefresh"
      @search="onSearch"
    />

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-6">
        <entities-list
          :items="unselectedItems"
          :loading="unselectedLoading"
          :has-more="unselectedHasMore"
          @select="onSelect"
          @load-more="onLoadMoreUnselected"
          @reorder="onReorderUnselected"
        />
      </div>

      <div class="col-12 col-md-6">
        <selected-list
          :items="selectedItems"
          :loading="selectedLoading"
          @unselect="onUnselect"
          @reorder="onReorder"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue';
import SelectedList from '@/widgets/selected-list/ui/SelectedList.vue';
import EntitiesList from '@/widgets/entities-list/ui/EntitiesList.vue';
import ToolbarCard from '@/widgets/toolbar/ui/ToolbarCard.vue';
import type { EntityId } from '@/shared/types/primitives';
import { useEntityStore } from '@/entities/entity/model/entity.store';
import { debounce } from '@/shared/lib/time';
import type { ReorderPayload } from '@/entities/entity/model/dto';
import ErrorBanner from '@/shared/ui/ErrorBanner.vue';

export default defineComponent({
  components: { ErrorBanner, EntitiesList, SelectedList, ToolbarCard },

  setup() {
    const entitiesStore = useEntityStore();

    const busy = computed(() =>
      entitiesStore.loading.unselected ||
      entitiesStore.loading.selected ||
      entitiesStore.loading.mutate,
    );
    const mutateLoading = computed(() => entitiesStore.loading.mutate);
    function onReset() {
      void entitiesStore.resetSelection();
    }

    function onRefresh() {
      void entitiesStore.refresh();
    }

    const sendReorder = debounce((params: ReorderPayload) => {
      void entitiesStore.enqueueMutations({ reorder: params });
    }, 250);

    function onReorder(params: ReorderPayload) {
      sendReorder(params);
    }

    const onReorderUnselected = (params: ReorderPayload) => {
      entitiesStore.reorderAvailableLocal(params);
    };

    const unselectedItems = computed(() => entitiesStore.unselected);
    const unselectedLoading = computed(() => entitiesStore.loading.unselected);
    const unselectedHasMore = computed(() => entitiesStore.hasMoreAvailable);

    function onSelect(id: EntityId) {
      void entitiesStore.enqueueMutations({ select: [id] });
    }

    function onLoadMoreUnselected() {
      if (entitiesStore.unselectedCursor !== null && !entitiesStore.loading.unselected) {
        void entitiesStore.loadAvailable({ cursor: entitiesStore.unselectedCursor });
      }
    }

    function onSearch(params: { query: EntityId }) {
      entitiesStore.unselected = [];
      entitiesStore.unselectedCursor = null;
      void entitiesStore.loadAvailable({ q: params.query.toString() });
    }

    const selectedItems = computed(() => entitiesStore.selected);
    const selectedLoading = computed(() => entitiesStore.loading.selected);

    function onUnselect(id: EntityId) {
      void entitiesStore.enqueueMutations({ unselect: [id] });
    }

    onMounted(() => {
      void entitiesStore.refresh();
    });

    const errorMessage = computed(() => entitiesStore.error);
    function onErrorClose() {
      entitiesStore.clearError();
    }

    return {
      busy,
      mutateLoading,
      onReset,
      onRefresh,
      onReorder,
      onReorderUnselected,

      unselectedItems,
      unselectedLoading,
      unselectedHasMore,
      onSearch,
      onLoadMoreUnselected,

      selectedItems,
      selectedLoading,
      onSelect,
      onUnselect,

      errorMessage,
      onErrorClose,
    };
  },
});

</script>
