<script setup lang="ts">
// Vue
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  type Ref,
  ref,
  watch,
  watchEffect
} from 'vue';

// Types
import type { MoveList, Move } from '@/types';

// API / Utils
import {
  PositionApi,
  MoveApi,
  DatabaseApi,
  type DatabaseTypes
} from '@/database';
import { MoveUtil, PlayerUtil } from '@/utils';
import Board from '@sabaki/go-board';

// Components
import ConfirmDialog from '@/components/ConfirmDialog';
import GoBoard from '@/components/GoBoard.vue';
import CandidateMoveDisplay from '@/components/CandidateMoveDisplay.vue';
import MoveDisplay from '@/components/MoveDisplay.vue';

const showConfirmDeleteModal = ref(false);

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

const dbPosition: Ref<DatabaseTypes.Position | null> = ref(null);

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
          type: 'interesting',
          faint: true
        };
      }
    });
  }
  ghostStones.value = newGhostStones;
};

watchEffect(setGhostStones);

const refetchDatabaseInfo = inject('refetchDatabaseInfo') as Ref<string>;
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
        PlayerUtil.getOtherPlayer(move.player),
        priorBoard
      );
    }
    priorBoard = move.board;
  }
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
  } else if (dbPosition.value && dbPosition.value?.candidateMoves.length > 0) {
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
  if (event.key === 'ArrowLeft') {
    previousMove();
  } else if (event.key === 'ArrowRight') {
    nextMove();
  }
};

const databases = ref([] as string[]);
const updateDatabaseList = async () => {
  databases.value = await DatabaseApi.getAvailableDatabases();
};
onMounted(async () => {
  updateDatabaseList();
});
onMounted(() => {
  window.addEventListener('keydown', cycleMove);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', cycleMove);
});

const reachablePositionCount = ref(0);
const loadingPositionCount = ref(false);
watch(
  [showConfirmDeleteModal],
  async () => {
    loadingPositionCount.value = true;
    reachablePositionCount.value =
      await PositionApi.countReachablePositionsFromBoard(
        board.value,
        player.value
      );
    loadingPositionCount.value = false;
  },
  {
    immediate: true
  }
);

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
</script>
<template>
  <div class="page" @keyup.up="previousMove" @keyup.down="nextMove">
    <div class="page__sidebar">
      <MoveDisplay
        :moves="moveList"
        :turn="turn"
        :board-height="board.height"
        @mouseenter="setHoveredBoard"
        @focusin="setHoveredBoard"
        @focusout="setHoveredBoard(null)"
        @mouseleave:all="setHoveredBoard(null)"
        @click="jumpToPosition"
      />
      <CandidateMoveDisplay
        :position="dbPosition ?? undefined"
        :dimensions="{ rows: board.height, columns: board.width }"
      />
    </div>
    <span class="page__main">
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
      <span class="page__actions">
        <q-btn
          no-caps
          class="actions__button"
          text-color="accent"
          color="negative"
          @click="showConfirmDeleteModal = true"
          >Delete current line</q-btn
        >
        <q-btn
          no-caps
          class="actions__button"
          text-color="accent"
          color="primary"
          @click="saveMoves()"
          >Save</q-btn
        >
        <q-btn
          no-caps
          class="actions__button actions__button--tenuki"
          text-color="accent"
          color="primary"
          @click="tenuki()"
          >Tenuki</q-btn
        >
      </span>
    </span>
    <ConfirmDialog
      v-model:show="showConfirmDeleteModal"
      title="Delete moves?"
      :loading="loadingPositionCount"
      @confirm="deletePositions()"
    >
      <span v-if="loadingPositionCount" class="dialog">
        <q-spinner-oval size="md" color="primary" />
      </span>
      <span v-else> This will delete {{ reachablePositionCount }} moves. </span>
    </ConfirmDialog>
  </div>
</template>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.page {
  margin: 0 1rem;
  display: grid;
  gap: 1rem;

  @include mixin-for-tablet-landscape-up {
    grid-template-columns: 23rem 1fr;
  }

  &__sidebar {
    display: grid;
    gap: 1rem;
    grid-template-rows: minmax(250px, 1fr) minmax(250px, min-content);

    @include mixin-for-tablet-portrait-up {
      grid-template-columns: repeat(2, 1fr);
    }

    @include mixin-for-tablet-landscape-up {
      grid-template-columns: 1fr;
      grid-column: 1;
      grid-row: 1 / -1;
    }
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    grid-row: 1;
  }

  &__actions {
    grid-column: 1 / -1;
    max-width: 800px;
    display: grid;
    grid-template-columns: repeat(2, max-content) 1fr max-content;
    gap: 1rem;
  }
}

.dialog {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.actions__button--tenuki {
  grid-column: -1;
}
</style>
