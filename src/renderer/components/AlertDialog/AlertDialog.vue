<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
});
const showModal = computed({
  get: () => {
    return props.show;
  },
  set: (val: boolean) => {
    emit('update:show', val);
  }
});

const emit = defineEmits(['update:show']);
</script>
<template>
  <q-dialog v-model="showModal">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          <slot name="header"></slot>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <slot></slot>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="OK" color="primary" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<style lang="scss"></style>
