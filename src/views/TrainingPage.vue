<template>
  <div id="train-page">
    <Train
      v-model:player="player"
      v-model:moveList="moveList"
      v-model:turn="turn"
      :board="board"
      :width="targetWidth"
      :accepted-move="acceptedMove"
      :candidate-moves="candidateMoves"
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
import Board, { Vertex } from "@sabaki/go-board";
import { Training } from "@/constants";
import { BoardUtil } from "@/utils";

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

    const candidateMoves: Ref<Vertex[]> = ref([]);
    const board = ref(Board.fromDimensions(rows.value, columns.value));
    const player: Ref<1 | -1> = ref(1);
    const turn: Ref<number> = ref(0);

    const currentPosition = computed(() => {
      return PositionApi.getPositionById(currentMove.value.previousPositionId);
    });

    const acceptedMove = computed((): Vertex => {
      if (currentMove.value) {
        return [currentMove.value.point.x, currentMove.value.point.y];
      }
      return [-1, -1];
    });

    const setCurrentBoard = async () => {
      const position = await currentPosition.value;
      if (position) {
        board.value = BoardUtil.getBoardFromPosition(position, columns.value, rows.value);
        console.log("Accepted Move: ", acceptedMove.value);
        player.value = position.player === 1 ? 1 : -1;
        candidateMoves.value = position.candidateMoves.map(move => {
          return [move.point.x, move.point.y]
        })
      }
    }


    // const nextPosition = computed(() => {
    //   return PositionApi.getPositionById(currentMove.value.positionId);
    // });

    // const getNextBoard = async () => {
    //   const position = await nextPosition.value;
    //   if (position) {
    //     return BoardUtil.getBoardFromPosition(position, columns.value, rows.value);
    //   }
    // }

    const moveList = ref([
      {
        board: Board.fromDimensions(rows.value, columns.value),
        player: -1,
        priorMove: null
      } as Move
    ] as MoveList);

    const movesToTrain: Ref<DbType.Move[]> = ref([]);
    const currentMove = computed(() => {
      return movesToTrain.value[movesToTrain.value.length - 1];
    });

    onMounted(async () => {
      movesToTrain.value = await MoveApi.getMovesForCurrentSession();
      setCurrentBoard();
    });

    const checkSolved = ({
      result,
    }: {
      result: Training.Result;
      board: Board;
    }) => {
      if (result === Training.Result.solved) {
        alert("Success");
        movesToTrain.value.pop();
        if (movesToTrain.value.length > 0) {
          setCurrentBoard();
        }
        else {
          alert("All done training!")
        }
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
      setCurrentBoard,
      checkSolved,
      acceptedMove,
      candidateMoves
    };
  }
});
</script>

<style>
#train-page {
  text-align: center;
}
</style>
