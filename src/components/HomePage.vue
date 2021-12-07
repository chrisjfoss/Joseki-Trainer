<template>
  <div class="main" @keyup.up="previousMove" @keyup.down="nextMove">
    <MoveDisplay
      :moves="moveList"
      :turn="turn"
      @mouseenter="setHoveredBoard"
      @mouseleave:all="setHoveredBoard(null)"
      @click="jumpToPosition"
    />
    <GoBoard
      v-model:player="player"
      v-model:moveList="moveList"
      v-model:turn="turn"
      :board="displayBoard"
      show-coordinates
      @update:board="(val) => (board = val)"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  Ref,
  ref
} from "vue";
import GoBoard from "./GoBoard.vue";
import Board from "@sabaki/go-board";
import type { MoveList, Move } from "../types";
import MoveDisplay from "./MoveDisplay.vue";

export default defineComponent({
  name: "HomePage",
  components: { GoBoard, MoveDisplay },
  setup() {
    const rows = 9;
    const columns = 9;

    const player: Ref<1 | -1> = ref(1);
    const turn: Ref<number> = ref(0);
    const board = ref(Board.fromDimensions(rows, columns));
    const moveList = ref([
      {
        board: Board.fromDimensions(rows, columns),
        player: -1,
        priorMove: null
      } as Move
    ] as MoveList);
    const hoveredBoard = ref(null as Board | null);

    const displayBoard = computed(() => {
      return hoveredBoard.value ?? board.value;
    });

    const setHoveredBoard = (move: Move | null) => {
      hoveredBoard.value = move?.board ?? null;
    };

    const jumpToPosition = (moveClickEvent: { move: Move; turn: number }) => {
      if (moveClickEvent.move) {
        board.value = moveClickEvent.move.board;
        player.value = moveClickEvent.move.player === 1 ? -1 : 1;
        turn.value = moveClickEvent.turn;
      }
    };

    const previousMove = () => {
      if (turn.value >= 1) {
        turn.value--;
        board.value = moveList.value[turn.value].board;
        player.value = moveList.value[turn.value].player === 1 ? -1 : 1;
      }
    };
    const nextMove = () => {
      if (turn.value < moveList.value.length - 1) {
        turn.value++;
        board.value = moveList.value[turn.value].board;
        player.value = moveList.value[turn.value].player === 1 ? -1 : 1;
      }
    };

    const cycleMove = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        previousMove();
      } else if (event.key === "ArrowRight") {
        nextMove();
      }
    };

    onMounted(() => {
      window.addEventListener("keydown", cycleMove);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("keydown", cycleMove);
    });

    return {
      displayBoard,
      board,
      moveList,
      player,
      setHoveredBoard,
      jumpToPosition,
      turn,
      previousMove,
      nextMove
    };
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.main {
  display: grid;
  grid-template-columns: 10rem 1fr;
}
</style>
