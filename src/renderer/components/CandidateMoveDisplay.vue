<script setup lang="ts">
// Vue
import { computed } from 'vue';

// Types
import type { DatabaseTypes } from '@/database';

// Utils
import { MoveUtil } from '@/utils';
import { GobanHelper } from 'vue-shudan';

// Components
import ScrollableCard from './ScrollableCard';

const props = defineProps<{
  position: DatabaseTypes.Position | null;
  dimensions: {
    rows: number;
    columns: number;
  };
}>();

const candidates = computed(() => {
  return props.position?.candidateMoves ?? [];
});
const getVertexName = (vertex: { x: number; y: number }) => {
  if (!vertex) {
    return '';
  }
  return `${GobanHelper.alpha[vertex.x]}${props.dimensions.rows - vertex.y}`;
};
const getMoveDisplay = (candidate: DatabaseTypes.Move, index: number) => {
  let display = `${index + 1}.`;
  if (MoveUtil.isTenuki(candidate)) {
    return `${index + 1}.Tenuki`;
  }
  display += getVertexName(candidate.point);
  if (candidate.comments) {
    display += `: ${candidate.comments}`;
  }
  return display;
};
</script>
<template>
  <ScrollableCard header="Candidate Moves">
    <span class="moves">
      <div v-for="(candidate, i) in candidates" :key="i" class="moves__item">
        {{ getMoveDisplay(candidate, i) }}
      </div>
    </span>
  </ScrollableCard>
</template>
<style scoped lang="scss">
.moves {
  display: grid;
  gap: 0.5rem;
}
</style>
