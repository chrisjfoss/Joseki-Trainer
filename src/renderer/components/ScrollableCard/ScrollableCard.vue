<script setup lang="ts">
defineProps<{ header: string }>();
</script>
<template>
  <q-card dark class="card">
    <q-card-section v-if="header" class="card__header">
      {{ header }}
    </q-card-section>
    <q-separator v-if="header" color="accent" dark inset />
    <q-card-section>
      <q-scroll-area class="card__body" visible>
        <slot />
      </q-scroll-area>
    </q-card-section>
  </q-card>
</template>
<style scoped lang="scss">
.card {
  display: grid;
  grid-template-rows: repeat(2, min-content) 1fr min-content;
  padding: 0;
  background-color: var(--primary);
  color: var(--text);

  &__header {
    font-size: 1.5rem;
    padding: 1.4rem 0 1rem;
    font-weight: normal;
    text-align: center;
    margin: 0;
  }
  &__body {
    height: 100%;
  }
}
</style>
