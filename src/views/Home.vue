<template>
  <div class="main" @keyup.up="previousMove" @keyup.down="nextMove">
    <MoveDisplay
      :moves="moveList"
      :turn="turn"
      :board-height="board.height"
      :max-height="`${targetWidth}px`"
      @mouseenter="setHoveredBoard"
      @mouseleave:all="setHoveredBoard(null)"
      @click="jumpToPosition"
    />
    <GoBoard
      v-model:player="player"
      v-model:moveList="moveList"
      v-model:turn="turn"
      class="board"
      :width="`${targetWidth}px`"
      :board="displayBoard"
      show-coordinates
      :ghost-stones="ghostStones"
      @update:board="(val) => (board = val)"
    />
    <button @click="transform(Transformation.rot90)">Rotate 90</button>
    <button @click="transform(Transformation.rot180)">Rotate 180</button>
    <button @click="transform(Transformation.rot270)">Rotate 270</button>
    <button @click="transform(Transformation.mirror)">Mirror</button>
    <button @click="transform(Transformation.mirrorRot90)">Mirror 90</button>
    <button @click="transform(Transformation.mirrorRot180)">Mirror 180</button>
    <button @click="transform(Transformation.mirrorRot270)">Mirror 270</button>
    <button @click="saveMoves()">Save</button>
    <button @click="getPosition()">Get Current Position</button>
    <button @click="deleteDatabase()">Delete Database</button>
    <button @click="getAllMoves()">Get All Moves</button>
    <button @click="getAllPositions()">Get All Positions</button>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  Ref,
  ref,
  watchEffect
} from "vue";
import GoBoard from "../components/GoBoard.vue";
import Board, { Vertex } from "@sabaki/go-board";
import type { MoveList, Move } from "../types";
import MoveDisplay from "../components/MoveDisplay.vue";

import { Matrix } from "@/utils";
import { PositionApi, MoveApi, DatabaseApi } from "@/api";
import { Player } from "@/db/types";

export default defineComponent({
  name: "HomePage",
  components: { GoBoard, MoveDisplay },
  setup() {
    const rows = ref(19);
    const columns = ref(19);

    const player: Ref<1 | -1> = ref(1);
    const turn: Ref<number> = ref(0);
    const board = ref(Board.fromDimensions(rows.value, columns.value));
    const moveList = ref([
      {
        board: Board.fromDimensions(rows.value, columns.value),
        player: -1,
        priorMove: null
      } as Move
    ] as MoveList);
    const hoveredBoard = ref(null as Board | null);

    const displayBoard = computed(() => {
      return hoveredBoard.value ?? board.value;
    });

    const windowHeight = ref(window.innerHeight);
    const windowWidth = ref(window.innerWidth);

    window.onresize = () => {
      windowHeight.value = window.innerHeight;
      windowWidth.value = window.innerWidth;
    };

    const targetWidth = computed(() => {
      return Math.min(windowWidth.value - 200, windowHeight.value - 200);
    });

    const ghostStones = ref(
      Array(rows.value)
        .fill(null)
        .map(() => Array(columns.value).fill(null))
    );

    watchEffect(async () => {
      const dbPosition = await PositionApi.getPositionFromBoard(
        displayBoard.value,
        player.value
      );
      const newGhostStones = Array(rows.value)
        .fill(null)
        .map(() => Array(columns.value).fill(null));
      if (dbPosition) {
        dbPosition.candidateMoves.forEach((move) => {
          newGhostStones[move.point.y][move.point.x] = {
            sign: player.value,
            type: "interesting",
            faint: true
          };
        });
      }
      ghostStones.value = newGhostStones;
    });

    const saveMoves = async () => {
      let priorBoard: Board | null = null;

      for (let i = 0; i <= turn.value; ++i) {
        const move = moveList.value[i];
        if (priorBoard && move.priorMove) {
          await MoveApi.saveMove(
            move.priorMove,
            move.board,
            (move.player * -1) as Player,
            priorBoard
          );
        }
        priorBoard = move.board;
      }
    };

    const getAllMoves = async () => {
      const moves = await MoveApi.getAllMoves();
      console.log(moves);
    };

    const getAllPositions = async () => {
      const positions = await PositionApi.getAllPositions();
      console.log(positions);
    };

    const getPosition = async () => {
      console.log(
        "Position: ",
        await PositionApi.getPositionFromBoard(board.value, player.value)
      );
    };

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

    const transform = (transformation: Matrix.Transformation) => {
      for (let i = 0; i < moveList.value.length; ++i) {
        const newMoveList = [...moveList.value];
        newMoveList[i].board.signMap = Matrix.getTransformation(
          transformation,
          newMoveList[i].board.signMap
        );
        if (newMoveList[i].priorMove) {
          newMoveList[i].priorMove = Matrix.getVerticeTransformation(
            newMoveList[i].priorMove as Vertex,
            transformation,
            newMoveList[i].board.width,
            newMoveList[i].board.height
          );
        }
        moveList.value = newMoveList;
      }
    };

    const deleteDatabase = async () => {
      await DatabaseApi.deleteDatabase();
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
      nextMove,
      Transformation: Matrix.Transformation,
      transform,
      saveMoves,
      getPosition,
      deleteDatabase,
      getAllMoves,
      getAllPositions,
      ghostStones,
      targetWidth
    };
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main {
  display: grid;
  grid-template-columns: 23rem 1fr;
}
.board {
  justify-self: center;
}
</style>
