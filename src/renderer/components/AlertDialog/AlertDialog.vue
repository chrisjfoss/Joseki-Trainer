<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  color: {
    type: String,
    required: false,
    default: 'primary'
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
  <q-dialog v-model="showModal" class="theme theme--earth">
    <q-card class="dialog">
      <q-card-section class="dialog__header">
        <div class="text-h6">
          <slot name="header"></slot>
        </div>
      </q-card-section>

      <q-card-section class="dialog__body q-pt-none">
        <slot></slot>
      </q-card-section>

      <q-card-actions align="right" class="dialog__actions">
        <q-btn v-close-popup label="OK" :color="color" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<style scoped lang="scss">
.dialog {
  min-width: 300px;
}
</style>
