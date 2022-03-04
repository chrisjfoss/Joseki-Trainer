<script lang="ts">
import { MoveList, Move } from "@/types";
import { Vertex } from "@sabaki/go-board";
import { defineComponent } from "@vue/runtime-core";
import { computed } from "vue";
import { alpha } from "./GoBoard/ShudanPort/helper";

export default defineComponent({
  name: "MoveList",
  props: {
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
      default: "100%"
    }
  },
  emits: ["mouseenter", "mouseleave", "click", "mouseleave:all"],
  setup(props, context) {
    const getVertexName = (vertex: Vertex | null) => {
      if (!vertex) {
        return "";
      }
      return `${alpha[vertex[0]]}${props.boardHeight - vertex[1]}`;
    };

    const emitMouseEnter = (move: Move) => {
      context.emit("mouseenter", move);
    };
    const emitMouseLeave = (move: Move) => {
      context.emit("mouseleave", move);
    };
    const emitClick = (move: Move, moveIndex: number) => {
      context.emit("click", { move, turn: moveIndex });
    };
    const emitMouseLeaveAll = () => {
      context.emit("mouseleave:all");
    };
    const filteredMoves = computed(() => {
      return props.moves.filter((move, j) => j % 2 == 1);
    });

    return {
      getVertexName,
      emitMouseEnter,
      emitMouseLeave,
      emitMouseLeaveAll,
      emitClick,
      filteredMoves
    };
  }
});
</script>
<template>
  <div :style="{ 'max-height': maxHeight }" @mouseleave="emitMouseLeaveAll">
    <ul class="move-list">
      <span v-for="(move, i) in filteredMoves" :key="i">
        <li v-if="move.priorMove" class="move">
          <span>{{ i + 1 }}.</span>
          <span
            :class="`${turn === 2 * i + 1 ? 'current' : ''} turn`"
            @mouseenter="emitMouseEnter(move)"
            @mouseleave="emitMouseLeave(move)"
            @click="emitClick(move, 2 * i + 1)"
            >{{ getVertexName(move.priorMove) }}</span
          >
          <span
            v-if="2 * i + 2 < moves.length"
            :class="`${turn === 2 * i + 2 ? 'current' : ''} turn`"
            @mouseenter="emitMouseEnter(moves[2 * i + 2])"
            @mouseleave="emitMouseLeave(moves[2 * i + 2])"
            @click="emitClick(moves[2 * i + 2], 2 * i + 2)"
            >{{ getVertexName(moves[2 * i + 2].priorMove) }}</span
          >
        </li>
      </span>
    </ul>
  </div>
</template>
<style lang="scss">
.move-list {
  list-style: none;
  padding: 1.5rem;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, max-content);
  row-gap: 0.5rem;
  column-gap: 1rem;
  background-color: var(--primary);
  margin: auto;
  height: 100%;
  color: var(--text);
  align-content: baseline;
  overflow-y: auto;
}

.move {
  display: grid;
  grid-template-columns: max-content 1fr 1fr;
  column-gap: 0.25rem;
  justify-content: start;
  text-align: start;
  position: relative;
  cursor: pointer;
  width: 100%;

  .turn:hover {
    background-color: var(--text);
    color: var(--background);
    opacity: 0.2;
  }
}
.current {
  background-color: var(--text);
  color: var(--background);
  opacity: 0.4;
}
</style>
