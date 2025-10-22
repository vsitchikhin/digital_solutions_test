<template>
  <q-alert
    v-if="message"
    dense
    color="negative"
    text-color="white"
    icon="error"
    class="q-mb-md"
    :model-value="visible"
    @update:model-value="onClose"
  >
    {{ message }}
  </q-alert>
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
