<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
});
const emit = defineEmits(['update:show', 'confirm']);

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
  <q-dialog v-model="showModal" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <span class="q-ml-sm">
          <slot></slot>
        </span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="Cancel" color="primary" />
        <q-btn flat label="Confirm" color="primary" @click="confirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<style lang="scss"></style>
