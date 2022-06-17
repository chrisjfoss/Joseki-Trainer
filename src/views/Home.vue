<template>
  <div class="main" @keyup.up="previousMove" @keyup.down="nextMove">
    <div class="main__sidebar">
      <MoveDisplay
        :moves="moveList"
        :turn="turn"
        :board-height="board.height"
        @mouseenter="setHoveredBoard"
        @mouseleave:all="setHoveredBoard(null)"
        @click="jumpToPosition"
      />
      <CandidateMoveDisplay
        :position="dbPosition ?? undefined"
        :dimensions="{ rows: board.height, columns: board.width }"
      />
    </div>
    <GoBoard
      v-model:player="player"
      v-model:moveList="moveList"
      v-model:turn="turn"
      class="board"
      :board="displayBoard"
      show-coordinates
      :ghost-stones="ghostStones"
      width="100%"
      @update:board="(val) => (board = val)"
    />
    <button @click="saveMoves()">Save</button>
    <button @click="getPosition()">Get Current Position</button>
    <button @click="deleteDatabase()">Delete Database</button>
    <button @click="getAvailableDatabases()">Get Available Databases</button>
    <button @click="getAllMoves()">Get All Moves</button>
    <button @click="getAllPositions()">Get All Positions</button>
    <button @click="tenuki()">Tenuki</button>
    <button @click="deletePositions()">Delete current line</button>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  inject,
  onBeforeUnmount,
  onMounted,
  Ref,
  ref,
  watch,
  watchEffect
} from "vue";
import GoBoard from "../components/GoBoard.vue";
import Board from "@sabaki/go-board";
import type { MoveList, Move } from "../types";
import MoveDisplay from "../components/MoveDisplay.vue";

import { PositionApi, MoveApi, DatabaseApi } from "@/api";
import { Player, Position } from "@/db/types";
import CandidateMoveDisplay from "@/components/CandidateMoveDisplay.vue";
import { MoveUtil } from "@/utils";

export default defineComponent({
  name: "HomePage",
  components: { GoBoard, MoveDisplay, CandidateMoveDisplay },
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
      windowHeight.value =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;
      windowWidth.value =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;
    };

    const ghostStones = ref(
      Array(rows.value)
        .fill(null)
        .map(() => Array(columns.value).fill(null))
    );

    const dbPosition: Ref<Position | null> = ref(null);

    const setGhostStones = async () => {
      dbPosition.value =
        (await PositionApi.getPositionFromBoard(
          displayBoard.value,
          player.value
        )) ?? null;
      const newGhostStones = Array(rows.value)
        .fill(null)
        .map(() => Array(columns.value).fill(null));
      if (dbPosition.value) {
        dbPosition.value.candidateMoves.forEach((move) => {
          if (!MoveUtil.isTenuki(move)) {
            newGhostStones[move.point.y][move.point.x] = {
              sign: player.value,
              type: "interesting",
              faint: true
            };
          }
        });
      }
      ghostStones.value = newGhostStones;
    };

    watchEffect(setGhostStones);

    const refetchDatabaseInfo = inject("refetchDatabaseInfo") as Ref<string>;
    watch(
      refetchDatabaseInfo,
      async () => {
        if (refetchDatabaseInfo.value) {
          await setGhostStones();
        }
      },
      {
        immediate: true
      }
    );

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

    const processingMove = ref(false);
    const previousMove = () => {
      processingMove.value = true;
      if (turn.value >= 1) {
        turn.value--;
        board.value = moveList.value[turn.value].board;
        player.value = moveList.value[turn.value].player === 1 ? -1 : 1;
      }
      processingMove.value = false;
    };
    const nextMove = () => {
      processingMove.value = true;
      if (turn.value < moveList.value.length - 1) {
        turn.value++;
        board.value = moveList.value[turn.value].board;
        player.value = moveList.value[turn.value].player === 1 ? -1 : 1;
        processingMove.value = false;
      } else if (
        dbPosition.value &&
        dbPosition.value?.candidateMoves.length > 0
      ) {
        const move: [number, number] = [
          dbPosition.value.candidateMoves[0].point.x,
          dbPosition.value.candidateMoves[0].point.y
        ];
        board.value = board.value.makeMove(player.value, move);
        player.value = player.value === 1 ? -1 : 1;
        moveList.value.push({
          board: board.value,
          player: player.value === 1 ? -1 : 1,
          priorMove: move
        });
        turn.value++;
      } else {
        processingMove.value = false;
      }
    };

    watch(dbPosition, () => {
      processingMove.value = false;
    });

    const cycleMove = (event: KeyboardEvent) => {
      if (processingMove.value) return;
      if (event.key === "ArrowLeft") {
        previousMove();
      } else if (event.key === "ArrowRight") {
        nextMove();
      }
    };

    const deleteDatabase = async () => {
      await DatabaseApi.deleteDatabase(DatabaseApi.getCurrentDatabaseName());
    };

    const getAvailableDatabases = async () => {
      const databases = await DatabaseApi.getAvailableDatabases();
      console.log(databases);
    };

    const databases = ref([] as string[]);
    const updateDatabaseList = async () => {
      databases.value = await DatabaseApi.getAvailableDatabases();
    };
    onMounted(async () => {
      updateDatabaseList();
    });
    onMounted(() => {
      window.addEventListener("keydown", cycleMove);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("keydown", cycleMove);
    });

    const tenuki = () => {
      moveList.value.push({
        ...moveList.value[turn.value],
        priorMove: [-1, -1],
        player: player.value
      });
      turn.value++;
      player.value = (player.value * -1) as -1 | 1;
    };

    const isLastMoveTenuki = computed(() => {
      return moveList.value[turn.value].player === player.value;
    });

    const deletePositions = async () => {
      if (turn.value > 0) {
        const prevTurnPlayer = isLastMoveTenuki.value
          ? player.value
          : ((player.value * -1) as -1 | 1);
        const prevPosition = await PositionApi.getPositionFromBoard(
          moveList.value[turn.value - 1].board,
          prevTurnPlayer
        );
        const currentPosition = await PositionApi.getPositionFromBoard(
          moveList.value[turn.value].board,
          moveList.value[turn.value].player === 1 ? -1 : 1
        );
        if (prevPosition?.id && currentPosition?.id) {
          const dbMove = await MoveApi.getMoveByPrevAndCurrentPositionId(
            prevPosition.id,
            currentPosition.id
          );
          if (dbMove?.id) {
            await MoveApi.removeLine(dbMove.id);
          }
        }
      }
    };

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
      saveMoves,
      getPosition,
      deleteDatabase,
      getAvailableDatabases,
      getAllMoves,
      getAllPositions,
      ghostStones,
      dbPosition,
      tenuki,
      deletePositions
    };
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.main {
  margin: 0 1rem;
  display: grid;
  grid-template-columns: 23rem 1fr;
  &__sidebar {
    display: grid;
    grid-template-rows: minmax(250px, 1fr) minmax(250px, min-content);
    row-gap: 1rem;
  }
}
.board {
  justify-self: center;
}
</style>
