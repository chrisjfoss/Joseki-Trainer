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
      if (isTenuki(vertex)) {
        return "Tenuki";
      }
      return `${alpha[vertex[0]]}${props.boardHeight - vertex[1]}`;
    };

    const tenukisBeforeTurn = computed(() => {
      const tenukis = movesWithTenukis.value
        .slice(0, props.turn + 1)
        .filter((move) => isTenuki(move)).length;
      return tenukis;
    });
    const movesWithTenukis = computed(() => {
      const fullMoves: Move[] = [];
      props.moves.forEach((move, moveIndex) => {
        if (
          moveIndex !== 0 &&
          move.player === props.moves[moveIndex - 1].player
        ) {
          fullMoves.push({
            player: (move.player * -1) as 1 | -1,
            board: move.board,
            priorMove: [-1, -1]
          });
        }
        fullMoves.push(move);
      });
      return fullMoves;
    });

    const emitMouseEnter = (moveIndex: number) => {
      context.emit("mouseenter", getNonTenukiMove(moveIndex));
    };
    const emitMouseLeave = (moveIndex: number) => {
      context.emit("mouseleave", getNonTenukiMove(moveIndex));
    };
    const emitClick = (moveIndex: number) => {
      let move = getNonTenukiMove(moveIndex);
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

    const getNonTenukiMove = (moveIndex: number) => {
      let move = movesWithTenukis.value[moveIndex];
      if (isTenuki(move)) {
        move = movesWithTenukis.value[moveIndex - 1];
      }
      return move;
    };

    const isTenuki = (move: Move | Vertex) => {
      if (move instanceof Array) {
        return move[0] === -1 && move[1] === -1;
      }
      return (
        !!move.priorMove && move.priorMove[0] === -1 && move.priorMove[1] === -1
      );
    };

    const filteredMoves = computed(() => {
      const filtered = movesWithTenukis.value.filter((move, j) => j % 2 == 1);
      console.log("Filtered moves: ", filtered);
      return filtered;
    });

    return {
      getVertexName,
      emitMouseEnter,
      emitMouseLeave,
      emitMouseLeaveAll,
      emitClick,
      filteredMoves,
      movesWithTenukis,
      tenukisBeforeTurn
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
            :class="`${
              turn === 2 * i + 1 - tenukisBeforeTurn ? 'current' : ''
            } turn`"
            @mouseenter="emitMouseEnter(2 * i + 1)"
            @mouseleave="emitMouseLeave(2 * i + 1)"
            @click="emitClick(2 * i + 1)"
            >{{ getVertexName(move.priorMove) }}</span
          >
          <span
            v-if="2 * i + 2 < movesWithTenukis.length"
            :class="`${
              turn === 2 * i + 2 - tenukisBeforeTurn ? 'current' : ''
            } turn`"
            @mouseenter="emitMouseEnter(2 * i + 2)"
            @mouseleave="emitMouseLeave(2 * i + 2)"
            @click="emitClick(2 * i + 2)"
          >
            {{ getVertexName(movesWithTenukis[2 * i + 2].priorMove) }}</span
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
