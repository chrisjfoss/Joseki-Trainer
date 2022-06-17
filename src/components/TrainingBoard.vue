<script lang="ts">
import { computed, PropType } from "vue";
import { defineComponent } from "@vue/runtime-core";
import Board from "@sabaki/go-board";
import GoBoard from "./GoBoard.vue";
import { MoveList } from "@/types";
import { Training } from "@/constants";
import { Position } from "@/db/types";
import { BoardUtil } from "@/utils";

export default defineComponent({
  name: "TrainingBoard",
  components: {
    GoBoard
  },
  props: {
    width: {
      type: [String, Number],
      required: false,
      default: "100%"
    },
    candidatePositions: {
      type: Array as PropType<Position[]>,
      required: false,
      default: () => []
    },
    acceptedPosition: {
      type: Object as PropType<Position>,
      required: true
    },
    board: {
      type: Object as PropType<Board>,
      required: false,
      default: () => new Board()
    },
    player: {
      type: Number as () => 1 | -1,
      required: true
    },
    turn: {
      type: Number,
      required: true
    },
    moveList: {
      type: Array as () => MoveList,
      required: true
    },
    interactable: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  emits: ["solved-position", "update:player", "update:turn", "update:moveList"],
  setup(props, context) {
    const acceptedBoard = computed(() => {
      return BoardUtil.getBoardFromPosition(
        props.acceptedPosition,
        props.board.width,
        props.board.height
      );
    });

    const candidateBoards = computed(() => {
      return props.candidatePositions.map((position) => {
        return BoardUtil.getBoardFromPosition(
          position,
          props.board.width,
          props.board.height
        );
      });
    });

    const checkMove = ({ board }: { board: Board }) => {
      if (!props.interactable) return;
      const madeAcceptedMove = BoardUtil.areEqualWithTransformation(
        acceptedBoard.value,
        board
      );
      const madeCandidateMove = candidateBoards.value
        .map((candidateBoard) => ({
          board: candidateBoard,
          ...BoardUtil.areEqualWithTransformation(candidateBoard, board)
        }))
        .filter((candidateInfo) => candidateInfo.equal);
      if (madeAcceptedMove.equal) {
        context.emit("solved-position", {
          result: Training.Result.solved,
          board,
          transformation: madeAcceptedMove.transformation
        });
      } else if (madeCandidateMove.length > 0) {
        context.emit("solved-position", {
          result: Training.Result.alternate,
          board,
          transformation: madeCandidateMove[0].transformation
        });
      } else {
        context.emit("solved-position", {
          result: Training.Result.failed,
          board
        });
      }
    };

    const computedPlayer = computed({
      get: () => {
        return props.player;
      },
      set: (value) => {
        if (!props.interactable) return;
        context.emit("update:player", value);
      }
    });

    const computedMoveList = computed({
      get: () => {
        return props.moveList;
      },
      set: (value) => {
        context.emit("update:moveList", value);
      }
    });

    const computedTurn = computed({
      get: () => {
        return props.turn;
      },
      set: (value) => {
        context.emit("update:turn", value);
      }
    });

    const ghostStones = computed(() => {
      if (!props.interactable) return [];
      return Array(props.board.height)
        .fill(null)
        .map(() => Array(props.board.width).fill(null));
    });

    return {
      checkMove,
      computedPlayer,
      computedMoveList,
      computedTurn,
      ghostStones
    };
  }
});
</script>
<template>
  <div>
    <GoBoard
      v-model:player="computedPlayer"
      v-model:moveList="computedMoveList"
      v-model:turn="computedTurn"
      :width="width"
      :board="board"
      :ghost-stones="ghostStones"
      show-coordinates
      @check-move="checkMove"
    />
  </div>
</template>
<style scoped lang="scss"></style>
