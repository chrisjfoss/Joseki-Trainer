<script lang="ts">
import { Ref, ref } from "vue";
import { defineComponent, onMounted } from "@vue/runtime-core";
import Board from "@sabaki/go-board";
import type { MoveList, Move } from "../types";
import * as DbType from "@/db/types";
import { MoveApi, PositionApi } from "@/api";
import GoBoard from "./GoBoard.vue";

export default defineComponent({
  name: "Train",
  components: {
    GoBoard
  },
  setup() {
    const rows = ref(19);
    const columns = ref(19);

    const player: Ref<1 | -1> = ref(1);
    const turn: Ref<number> = ref(0);
    const getCurrentPosition = () => {
      return PositionApi.getPositionById(
        movesToTrain.value[currentMove.value].previousPositionId
      );
    };
    const board = ref(Board.fromDimensions(columns.value, rows.value));
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

    return {
      player,
      turn,
      board,
      moveList,
      getCurrentPosition
    };
  }
});
</script>
<template>
  <div>
    <GoBoard
      v-model:player="player"
      v-model:moveList="moveList"
      v-model:turn="turn"
      width="75%"
      :board="board"
      show-coordinates
      @update:board="(val) => (board = val)"
    />
  </div>
</template>
<style lang="scss"></style>
