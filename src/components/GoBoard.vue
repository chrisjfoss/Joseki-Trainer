<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { computed, ref } from "vue";
import Board from "@sabaki/go-board";
import { GhostStone, Vertex } from "./GoBoard/ShudanPort/types";
import { MoveList } from "@/types";
import _ from "lodash";

export default defineComponent({
  name: "GoBoard",
  props: {
    width: {
      type: [Number, String],
      required: false,
      default: "100%"
    },
    maxWidth: {
      type: [Number, String],
      required: false,
      default: "100%"
    },
    board: {
      type: Object as () => InstanceType<typeof Board>,
      required: true
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
    showCoordinates: {
      type: Boolean,
      required: false,
      default: false
    },
    ghostStones: {
      type: Array as () => GhostStone[][],
      required: false,
      default: () => []
    }
  },
  emits: [
    "update:player",
    "update:board",
    "update:moveList",
    "update:turn",
    "check-move"
  ],
  setup(props, context) {
    const widthNumericPart = props.width.toString().replace(/[^0-9]/g, "");
    const widthUnitPart = props.width.toString().replace(/[0-9]/g, "");
    const vertexSize = computed(() => {
      const divisor = props.showCoordinates ? 2.5 : 1;
      return `${
        parseInt(widthNumericPart) / (props.board.width + divisor)
      }${widthUnitPart}`;
    });

    const ghostStoneMap = computed(() => {
      const returnMap =
        props.ghostStones === []
          ? Array(props.board.height)
              .fill(null)
              .map(() => Array(props.board.width).fill(null))
          : _.cloneDeep(props.ghostStones);

      try {
        if (highlightedVertex.value) {
          returnMap[highlightedVertex.value[1]][highlightedVertex.value[0]] = {
            sign: props.player,
            type: null,
            faint: true
          };
        }
      } catch {
        // Do nothing
      }

      return returnMap;
    });

    const highlightedVertex = ref<Vertex | null>(null);

    const addGhostStone = (vertex: Vertex) => {
      highlightedVertex.value = vertex;
    };

    const removeGhostStone = (vertex: Vertex) => {
      if (highlightedVertex.value === vertex) {
        highlightedVertex.value = null;
      }
    };

    const placeStone = (vertex: Vertex) => {
      const [x, y] = vertex;
      const { overwrite, suicide, ko } = props.board.analyzeMove(
        props.player,
        vertex
      );
      if (!overwrite && !suicide && !ko) {
        ghostStoneMap.value[y][x] = null;
        const board = props.board.makeMove(props.player, vertex);
        context.emit("update:board", board);
        context.emit("update:player", props.player * -1);
        context.emit("update:turn", props.turn + 1);
        context.emit("check-move", { move: vertex, board });

        const moveList = [
          ...props.moveList.slice(0, props.turn + 1),
          {
            board,
            priorMove: vertex,
            player: props.player
          }
        ];
        context.emit("update:moveList", moveList);
      }
    };

    return {
      vertexSize,
      ghostStoneMap,
      methods: {
        addGhostStone,
        removeGhostStone,
        placeStone
      }
    };
  }
});
</script>
<template>
  <div class="go-board">
    <Goban
      :sign-map="board.signMap"
      :vertex-size="vertexSize"
      fuzzy-stone-placement
      :ghost-stone-map="ghostStoneMap"
      :show-coordinates="showCoordinates"
      @pointerenter:vertex="methods.addGhostStone"
      @pointerleave:vertex="methods.removeGhostStone"
      @click:vertex="methods.placeStone"
    />
  </div>
</template>
<style lang="scss" scoped>
.go-board {
  width: 100%;
  max-width: 800px;
}
</style>
