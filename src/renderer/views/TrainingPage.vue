<template>
  <div id="train-page">
    <div :style="{ width: targetWidth, height: targetWidth }">
      <TrainingBoard
        v-if="acceptedPosition"
        v-model:player="player"
        v-model:moveList="moveList"
        v-model:turn="turn"
        :board="board"
        :accepted-position="acceptedPosition"
        :candidate-positions="candidatePositions"
        :interactable="interactable"
        @solved-position="checkSolved"
      />
    </div>
    <TrainingStats
      :number-correct="correctMoves"
      :number-incorrect="incorrectMoves"
      :number-remaining="remainingMoves"
    />
  </div>
</template>

<script lang="ts">
// Vue
import { defineComponent, type Ref, ref, computed, watch, inject } from 'vue';

// API
import { PositionApi, MoveApi, BoardApi } from '@/database';

// Components
import TrainingBoard from '@/components/TrainingBoard.vue';
import TrainingStats from '@/components/TrainingStats.vue';

// Constants
import { Training } from '@/constants';

// Types
import type { Move, MoveList } from '@/types';
import type { DatabaseTypes } from '@/database';
import Board from '@sabaki/go-board';

// Utils
import { BoardUtil, getRandomTransformation, Matrix } from '@/utils';
import { cloneDeep } from 'lodash';

export default defineComponent({
  name: 'TrainingPage',
  components: {
    TrainingBoard,
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
    const waitBetweenMoves = ref(1000);

    const candidatePositions: Ref<DatabaseTypes.Position[]> = ref([]);
    const board = ref(Board.fromDimensions(rows.value, columns.value));
    const player: Ref<1 | -1> = ref(1);
    const turn: Ref<number> = ref(0);
    const currentTransformation = ref(Matrix.Transformation.original);

    const movesToTrain: Ref<DatabaseTypes.Move[]> = ref([]);
    const currentMove = computed(() => {
      return movesToTrain.value[0];
    });
    const refetchDatabaseInfo = inject('refetchDatabaseInfo') as Ref<string>;
    watch(
      refetchDatabaseInfo,
      async () => {
        if (refetchDatabaseInfo.value) {
          movesToTrain.value =
            (await MoveApi.getMovesForCurrentSession()) ?? [];
        }
      },
      {
        immediate: true
      }
    );

    const interactable = ref(true);

    const currentPosition: Ref<DatabaseTypes.Position | undefined> = ref();
    const acceptedPosition: Ref<DatabaseTypes.Position | undefined> = ref();

    watch(currentMove, async () => {
      currentPosition.value = await PositionApi.getPositionById(
        currentMove.value.previousPositionId,
        true
      );
      acceptedPosition.value = await PositionApi.getPositionById(
        currentMove.value.positionId
      );

      if (currentPosition.value) {
        const dbBoard = await BoardApi.getBoardFromId(
          currentPosition.value.boardDimensionId
        );
        if (dbBoard) {
          columns.value = dbBoard.columns;
          rows.value = dbBoard.rows;
        }

        const newBoard = BoardUtil.getBoardFromPosition(
          currentPosition.value,
          columns.value,
          rows.value
        );

        if (!boardIsUpdatedFromChild.value) {
          currentTransformation.value = getRandomTransformation();
        }
        board.value = BoardUtil.applyTransformation(
          newBoard,
          currentTransformation.value
        );
        player.value = currentPosition.value.player === 1 ? 1 : -1;
        setCandidatePositions(currentPosition.value);
      }
    });

    const setCandidatePositions = async (position: DatabaseTypes.Position) => {
      const asyncCandidates = position.candidateMoves.map(async (move) => {
        return await PositionApi.getPositionById(move.positionId);
      });
      const awaitedCandidates = await Promise.all(asyncCandidates);
      const filteredCandidates = awaitedCandidates.filter(
        (candidate) =>
          candidate !== undefined && candidate.id !== currentMove.value.id
      ) as DatabaseTypes.Position[];
      candidatePositions.value = filteredCandidates;
    };

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
      transformation
    }: {
      result: Training.Result;
      board: Board;
      transformation: Matrix.Transformation;
    }) => {
      const originalBoard = board.value;
      board.value = solutionBoard;
      interactable.value = false;
      if (currentMove.value.id) {
        MoveApi.trainedMove(currentMove.value.id, result);
      }
      if (result === Training.Result.solved) {
        movesToTrain.value = movesToTrain.value.slice(
          1,
          movesToTrain.value.length
        );
        currentTransformation.value = transformation;
        boardIsUpdatedFromChild.value = true;
        correctMoves.value++;
        interactable.value = true;

        if (movesToTrain.value.length === 0) {
          alert('All done training!');
        }
      } else if (result === Training.Result.alternate) {
        setTimeout(() => {
          player.value = -player.value as 1 | -1;
          turn.value--;
          moveList.value.pop();
          boardIsUpdatedFromChild.value = false;
          board.value = originalBoard;
          interactable.value = true;
          alert('Alternate move. Try again.');
        }, waitBetweenMoves.value);
      } else {
        setTimeout(() => {
          player.value = -player.value as 1 | -1;
          turn.value--;
          moveList.value.pop();
          incorrectMoves.value++;
          const moveToSave = cloneDeep(movesToTrain.value[0]);
          movesToTrain.value = [
            ...movesToTrain.value.slice(1, movesToTrain.value.length),
            moveToSave
          ];
          boardIsUpdatedFromChild.value = false;
          board.value = originalBoard;
          interactable.value = true;
          alert('Incorrect.');
        }, waitBetweenMoves.value);
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
      interactable
    };
  }
});
</script>

<style lang="scss" scoped>
#train-page {
  margin: 0 1rem;
  text-align: center;
  display: grid;
  column-gap: 1rem;
  grid-template-columns: auto 250px;
}
</style>
