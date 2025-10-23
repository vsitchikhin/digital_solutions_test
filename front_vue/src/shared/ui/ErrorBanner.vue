<template>
  <q-banner
    v-if="message"
    dense
    class="q-mb-md bg-negative text-white"
    inline-actions
  >
    <div class="ellipsis">{{ message }}</div>
    <template #action>
      <q-btn flat dense label="Закрыть" @click="onClose" />
    </template>
  </q-banner>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  props: {
    message: {
      type: String,
      default: () => '',
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const visible = ref(!!props.message);

    watch(
      () => props.message,
      value => { visible.value = !!value; },
    );

    function onClose() {
      visible.value = false;
      emit('close');
    }

    return {
      visible,
      onClose,
    };
  },
});
</script>
