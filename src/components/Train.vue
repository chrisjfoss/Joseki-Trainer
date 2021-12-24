<script lang="ts">
import { computed, PropType, ref } from "vue";
import { defineComponent } from "@vue/runtime-core";
import Board, { Vertex } from "@sabaki/go-board";
import GoBoard from "./GoBoard.vue";
import { MoveList } from "@/types";
import { Training } from "@/constants";

export default defineComponent({
  name: "Train",
  components: {
    GoBoard
  },
  props: {
    width: {
      type: [String, Number],
      required: false,
      default: "100%"
    },
    candidateMoves: {
      type: Array as PropType<Vertex[]>,
      required: false,
      default: () => []
    },
    acceptedMove: {
      type: Object as PropType<Vertex>,
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
    }
  },
  emits: ["solved-position", "update:player", "update:turn", "update:moveList"],
  setup(props, context) {
    const checkMove = ({ move, board }: { move: Vertex; board: Board }) => {
      console.log("Board: ", board);
      console.log("Ghost Stones: ", ghostStones.value);

      console.log("Vertex: ", move);
      console.log("Accepted Move: ", props.acceptedMove);
      if (
        move[0] === props.acceptedMove[0] &&
        move[1] === props.acceptedMove[1]
      ) {
        context.emit("solved-position", {
          result: Training.Result.solved,
          board
        });
      } else if (
        props.candidateMoves.some(
          (candidate) => candidate[0] === move[0] && candidate[1] === move[1]
        )
      ) {
        context.emit("solved-position", {
          result: Training.Result.alternate,
          board
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
    const ghostStones = ref(
      Array(props.board.height)
        .fill(null)
        .map(() => Array(props.board.width).fill(null))
    );

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
<style lang="scss"></style>
