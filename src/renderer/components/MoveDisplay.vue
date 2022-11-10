<script lang="ts">
import { MoveList, Move } from "@/types";
import { MoveUtil } from "@/utils";
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
      if (isTenuki(vertex)) {
        return "Tenuki";
      }
      return `${alpha[vertex[0]]}${props.boardHeight - vertex[1]}`;
    };

    const emitMouseEnter = (moveIndex: number) => {
      context.emit("mouseenter", getMove(moveIndex));
    };
    const emitMouseLeave = (moveIndex: number) => {
      context.emit("mouseleave", getMove(moveIndex));
    };
    const emitClick = (moveIndex: number) => {
      let move = getMove(moveIndex);
      const correctIndex = props.moves.findIndex(
        (m) =>
          m.player === move.player &&
          m.board === move.board &&
          m.priorMove === move.priorMove
      );

      context.emit("click", {
        move: props.moves[correctIndex],
        turn: correctIndex
      });
    };
    const emitMouseLeaveAll = () => {
      context.emit("mouseleave:all");
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
  <div dark :style="{ 'max-height': maxHeight }" @mouseleave="emitMouseLeaveAll">
    <q-card tag="ul" class="move-list">
      <span v-for="(move, i) in filteredMoves" :key="i">
        <li v-if="move.priorMove" class="move">
          <span>{{ i + 1 }}.</span>
          <span
            :class="`${turn === 2 * i + 1 ? 'current' : ''} turn`"
            @mouseenter="emitMouseEnter(2 * i + 1)"
            @mouseleave="emitMouseLeave(2 * i + 1)"
            @click="emitClick(2 * i + 1)"
            >{{ getVertexName(move.priorMove) }}</span
          >
          <span
            v-if="2 * i + 2 < moves.length"
            :class="`${turn === 2 * i + 2 ? 'current' : ''} turn`"
            @mouseenter="emitMouseEnter(2 * i + 2)"
            @mouseleave="emitMouseLeave(2 * i + 2)"
            @click="emitClick(2 * i + 2)"
          >
            {{ getVertexName(moves[2 * i + 2].priorMove) }}</span
          >
        </li>
      </span>
    </q-card>
  </div>
</template>
<style scoped lang="scss">
.move-list {
  list-style: none;
  padding: 1.5rem;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, max-content);
  row-gap: 0.5rem;
  column-gap: 1rem;
  margin: auto;
  height: 100%;
  background-color: var(--primary);
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
