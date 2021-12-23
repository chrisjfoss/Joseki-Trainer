<template>
  <div id="train-page">
    <Train
      v-model:player="player"
      v-model:moveList="moveList"
      v-model:turn="turn"
      v-model:board="board"
      :width="targetWidth"
      :accepted-move="[0, 0]"
      :candidate-moves="[[1, 1]]"
      @solved-position="checkSolved"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, computed } from "vue";
import Train from "../components/Train.vue";
import { PositionApi, MoveApi } from "@/api";
import { Move, MoveList } from "@/types";
import * as DbType from "@/db/types";
import Board from "@sabaki/go-board";
import { Training } from "@/constants";

export default defineComponent({
  name: "TrainingPage",
  components: {
    Train
  },
  setup() {
    // Board Sizing
    const windowHeight = ref(window.innerHeight);
    const windowWidth = ref(window.innerWidth);
    window.onresize = () => {
      windowHeight.value = window.innerHeight;
      windowWidth.value = window.innerWidth;
    };
    const targetWidth = computed(() => {
      return `${Math.min(windowWidth.value - 200, windowHeight.value - 200)}px`;
    });

    // Board initialization
    const rows = ref(19);
    const columns = ref(19);

    const board = ref(Board.fromDimensions(rows.value, columns.value));

    const player: Ref<1 | -1> = ref(1);
    const turn: Ref<number> = ref(0);
    const getCurrentPosition = () => {
      return PositionApi.getPositionById(
        movesToTrain.value[currentMove.value].previousPositionId
      );
    };

    const moveList = ref([
      {
        board: Board.fromDimensions(rows.value, columns.value),
        player: -1,
        priorMove: null
      } as Move
    ] as MoveList);

    const movesToTrain: Ref<DbType.Move[]> = ref([]);
    const currentMove: Ref<number> = ref(0);

    onMounted(async () => {
      movesToTrain.value = await MoveApi.getMovesForCurrentSession();
    });

    const checkSolved = ({
      result,
      board: newBoard
    }: {
      result: Training.Result;
      board: Board;
    }) => {
      if (result === Training.Result.solved) {
        console.log(newBoard);
        board.value = newBoard;
      } else if (result === Training.Result.alternate) {
        player.value = -player.value as 1 | -1;
        turn.value--;
        moveList.value.pop();
        alert("Alternate move. Try again.");
      } else {
        player.value = -player.value as 1 | -1;
        turn.value--;
        moveList.value.pop();
        alert("Incorrect. Try again.");
      }
    };

    return {
      targetWidth,
      player,
      turn,
      moveList,
      board,
      getCurrentPosition,
      checkSolved
    };
  }
});
</script>

<style>
#train-page {
  text-align: center;
}
</style>
