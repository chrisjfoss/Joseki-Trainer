<template>
  <div id="train-page">
    <Train
      v-if="acceptedPosition"
      v-model:player="player"
      v-model:moveList="moveList"
      v-model:turn="turn"
      :board="board"
      :width="targetWidth"
      :accepted-position="acceptedPosition"
      :candidate-positions="candidatePositions"
      @solved-position="checkSolved"
    />
    <TrainingStats
      :number-correct="correctMoves"
      :number-incorrect="incorrectMoves"
      :number-remaining="remainingMoves"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, computed, watch } from "vue";
import Train from "../components/Train.vue";
import TrainingStats from "../components/TrainingStats.vue";
import { PositionApi, MoveApi } from "@/api";
import { Move, MoveList } from "@/types";
import * as DbType from "@/db/types";
import Board from "@sabaki/go-board";
import { Training } from "@/constants";
import { BoardUtil, getRandomTransformation, Matrix } from "@/utils";
import _ from "lodash";

export default defineComponent({
  name: "TrainingPage",
  components: {
    Train,
    TrainingStats
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

    const candidatePositions: Ref<DbType.Position[]> = ref([]);
    const board = ref(Board.fromDimensions(rows.value, columns.value));
    const player: Ref<1 | -1> = ref(1);
    const turn: Ref<number> = ref(0);
    const currentTransformation = ref(Matrix.Transformation.original)

    const movesToTrain: Ref<DbType.Move[]> = ref([]);
    const currentMove = computed(() => {
      return movesToTrain.value[0];
    });

    onMounted(async () => {
      movesToTrain.value = await MoveApi.getMovesForCurrentSession();
    });

    const currentPosition: Ref<DbType.Position | undefined> = ref();
    const acceptedPosition: Ref<DbType.Position | undefined> = ref();

    watch(currentMove, async () => {
      currentPosition.value = await PositionApi.getPositionById(currentMove.value.previousPositionId, true);
      acceptedPosition.value = await PositionApi.getPositionById(currentMove.value.positionId);

      if (currentPosition.value) {
        const newBoard = BoardUtil.getBoardFromPosition(currentPosition.value, columns.value, rows.value);

        if (!boardIsUpdatedFromChild.value || !BoardUtil.areEqualWithTransformation(board.value, newBoard).equal) {
          currentTransformation.value = getRandomTransformation();
          board.value = BoardUtil.applyTransformation(newBoard, currentTransformation.value);
        }
        player.value = currentPosition.value.player === 1 ? 1 : -1;
        setCandidatePositions(currentPosition.value);
      }
    });

    const setCandidatePositions = async (position: DbType.Position) => {
      const asyncCandidates = position.candidateMoves.map(async (move) => {
        return await PositionApi.getPositionById(move.positionId);
      });
      const awaitedCandidates = await Promise.all(asyncCandidates);
      const filteredCandidates = awaitedCandidates.filter(candidate => candidate !== undefined && candidate.id !== currentMove.value.id) as DbType.Position[];
      candidatePositions.value = filteredCandidates;
    }

    const moveList = ref([
      {
        board: Board.fromDimensions(rows.value, columns.value),
        player: -1,
        priorMove: null
      } as Move
    ] as MoveList);

    const boardIsUpdatedFromChild = ref(false);

    const checkSolved = ({
      result,
      board: solutionBoard,
      transformation,
    }: {
      result: Training.Result;
      board: Board;
      transformation: Matrix.Transformation;
    }) => {
      if (result === Training.Result.solved) {
        movesToTrain.value = movesToTrain.value.slice(1, movesToTrain.value.length);
        currentTransformation.value = transformation;
        board.value = solutionBoard;
        boardIsUpdatedFromChild.value = true;
        correctMoves.value++;

        if (movesToTrain.value.length === 0) {
          alert("All done training!")
        }
      } else if (result === Training.Result.alternate) {
        player.value = -player.value as 1 | -1;
        turn.value--;
        moveList.value.pop();
        boardIsUpdatedFromChild.value = false;
        alert("Alternate move. Try again.");
      } else {
        player.value = -player.value as 1 | -1;
        turn.value--;
        moveList.value.pop();
        incorrectMoves.value++;
        const moveToSave = _.cloneDeep(movesToTrain.value[0]);
        movesToTrain.value = [...movesToTrain.value.slice(1, movesToTrain.value.length), moveToSave];
        boardIsUpdatedFromChild.value = false;
        alert("Incorrect.");
      }
    };

    // Stats Initialization
    const correctMoves = ref(0);
    const incorrectMoves = ref(0);
    const remainingMoves = computed(() => {
      return movesToTrain.value.length;
    });

    return {
      targetWidth,
      player,
      turn,
      moveList,
      board,
      checkSolved,
      acceptedPosition,
      candidatePositions,
      correctMoves,
      incorrectMoves,
      remainingMoves,
    };
  }
});
</script>

<style>
#train-page {
  margin: 1rem;
  text-align: center;
  display: grid;
  column-gap: 1rem;
  grid-template-columns: auto 250px;
}
</style>
