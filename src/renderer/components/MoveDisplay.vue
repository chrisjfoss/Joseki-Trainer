<script setup lang="ts">
// Vue
import { computed } from 'vue';

// Utils
import { MoveUtil } from '@/utils';
import { alpha } from './GoBoard/ShudanPort/helper';

// Types
import type { MoveList, Move } from '@/types';
import type { Vertex } from '@sabaki/go-board';
import ScrollableCard from './ScrollableCard';

const props = defineProps({
  moves: {
    type: Array as () => MoveList,
    required: true
  },
  turn: {
    type: Number,
    required: true
  },
  boardHeight: {
    type: Number,
    required: true
  },
  maxHeight: {
    type: [Number, String],
    required: false,
    default: '100%'
  }
});
const emits = defineEmits([
  'mouseenter',
  'mouseleave',
  'click',
  'mouseleave:all'
]);

const getVertexName = (vertex: Vertex | null) => {
  if (!vertex) {
    return '';
  }
  if (isTenuki(vertex)) {
    return 'Tenuki';
  }
  return `${alpha[vertex[0]]}${props.boardHeight - vertex[1]}`;
};

const emitMouseEnter = (moveIndex: number) => {
  emits('mouseenter', getMove(moveIndex));
};
const emitMouseLeave = (moveIndex: number) => {
  emits('mouseleave', getMove(moveIndex));
};
const emitClick = (moveIndex: number) => {
  const move = getMove(moveIndex);
  const correctIndex = props.moves.findIndex(
    (m) =>
      m.player === move.player &&
      m.board === move.board &&
      m.priorMove === move.priorMove
  );

  emits('click', {
    move: props.moves[correctIndex],
    turn: correctIndex
  });
};
const emitMouseLeaveAll = () => {
  emits('mouseleave:all');
};

const getMove = (moveIndex: number) => {
  return props.moves[moveIndex];
};

const isTenuki = (move: Move | Vertex) => {
  let vertex: Vertex | null = null;
  if (move instanceof Array) {
    vertex = move;
  } else if (move.priorMove) {
    vertex = move.priorMove;
  }
  return MoveUtil.isTenuki(vertex);
};

const filteredMoves = computed(() => {
  const filtered = props.moves.filter((move, j) => j % 2 == 1);
  return filtered;
});
</script>
<template>
  <div
    class="display-container"
    @mouseleave="emitMouseLeaveAll"
    @focusout="emitMouseLeaveAll"
  >
    <scrollable-card header="Move List">
      <ul class="moves">
        <q-separator dark vertical class="moves__separator" />
        <template v-for="(move, i) in filteredMoves" :key="i">
          <li v-if="move.priorMove" class="move">
            <span>{{ i + 1 }}.</span>
            <span
              tabindex="0"
              :class="`${turn === 2 * i + 1 ? 'current' : ''} turn`"
              @mouseenter="emitMouseEnter(2 * i + 1)"
              @focusin="emitMouseEnter(2 * i + 1)"
              @mouseleave="emitMouseLeave(2 * i + 1)"
              @focusout="emitMouseLeave(2 * i + 1)"
              @click="emitClick(2 * i + 1)"
              @keydown.enter="emitClick(2 * i + 1)"
            >
              {{ getVertexName(move.priorMove) }}
            </span>
            <span
              v-if="2 * i + 2 < moves.length"
              tabindex="0"
              :class="`${turn === 2 * i + 2 ? 'current' : ''} turn`"
              @mouseenter="emitMouseEnter(2 * i + 2)"
              @mouseleave="emitMouseLeave(2 * i + 2)"
              @focusin="emitMouseEnter(2 * i + 2)"
              @focusout="emitMouseLeave(2 * i + 2)"
              @click="emitClick(2 * i + 2)"
              @keydown.enter="emitClick(2 * i + 2)"
            >
              {{ getVertexName(moves[2 * i + 2].priorMove) }}</span
            >
          </li>
        </template>
      </ul>
    </scrollable-card>
  </div>
</template>
<style scoped lang="scss">
.display-container {
  display: grid;
}
.moves {
  display: grid;
  grid-template-columns: 1fr min-content 1fr;
  column-gap: 1rem;
  padding: 0;
  margin: 0;

  &__separator {
    grid-column: 2 / 3;
    grid-row: 1 / 999;
  }
}

.move {
  display: grid;
  grid-template-columns: max-content repeat(2, minmax(min-content, 5rem));
  column-gap: 0.25rem;
  justify-content: start;
  text-align: start;
  position: relative;
  cursor: pointer;
  width: 100%;

  .turn {
    &:last-of-type {
      margin-left: 0.25rem;
    }
    &:hover {
      background-color: var(--text);
      color: var(--background);
      opacity: 0.8;
    }
  }
}
.current {
  background-color: var(--text);
  color: var(--background);
  opacity: 0.6;
}
</style>
