<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  loading: {
    type: Boolean,
    required: false
  },
  title: {
    type: String,
    required: false,
    default: ''
  },
  body: {
    type: String,
    required: false,
    default: ''
  },
  color: {
    type: String,
    required: false,
    default: 'primary'
  }
});
const emit = defineEmits(['update:show', 'confirm']);

const modalColor = computed(() => {
  return `bg-${props.color}`;
});

const showModal = computed({
  get: () => {
    return props.show;
  },
  set: (val: boolean) => {
    emit('update:show', val);
  }
});

const confirm = () => {
  showModal.value = false;
  emit('confirm');
};
</script>
<template>
  <q-dialog v-model="showModal" persistent class="theme theme--earth">
    <q-card class="dialog">
      <q-card-section v-if="title" class="dialog__title" :class="modalColor">
        <slot name="title">
          <h2 class="header">{{ title }}</h2>
        </slot>
      </q-card-section>
      <q-separator />
      <q-card-section class="dialog__body">
        <slot>{{ body }}</slot>
      </q-card-section>
      <q-separator />
      <q-card-actions align="between" class="dialog__actions">
        <q-btn v-close-popup flat label="Cancel" color="primary" />
        <q-btn
          label="Confirm"
          :color="color"
          :loading="loading"
          @click="confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<style scoped lang="scss">
.dialog {
  min-width: 300px;
  &__title {
    color: var(--text);
  }
}
</style>
