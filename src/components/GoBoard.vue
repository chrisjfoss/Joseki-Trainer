<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { computed, ref } from "vue";
import Goban from "./GoBoard/ShudanPort";
import Board from "@sabaki/go-board";
import { Vertex } from "./GoBoard/ShudanPort/types";
import { MoveList } from "@/types";

export default defineComponent({
  name: "GoBoard",
  components: { Goban },
  props: {
    width: {
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
    }
  },
  emits: ["update:player", "update:board", "update:moveList", "update:turn"],
  setup(props, context) {
    const widthNumericPart = props.width.toString().replace(/[^0-9]/g, "");
    const widthUnitPart = props.width.toString().replace(/[0-9]/g, "");
    const vertexSize = computed(() => {
      const divisor = props.showCoordinates ? 2.5 : 1;
      return `${
        parseInt(widthNumericPart) / (props.board.width + divisor)
      }${widthUnitPart}`;
    });

    const ghostStoneMap = ref(
      Array(props.board.height)
        .fill(null)
        .map(() => Array(props.board.width).fill(null))
    );

    const mostRecentVertexAdd = ref<Vertex | null>(null);

    const addGhostStone = (vertex: Vertex) => {
      const [x, y] = vertex;
      mostRecentVertexAdd.value = vertex;
      return new Promise(() => {
        if (
          mostRecentVertexAdd.value &&
          mostRecentVertexAdd.value[0] === vertex[0] &&
          mostRecentVertexAdd.value[1] === vertex[1] &&
          ghostStoneMap.value[y][x] === null &&
          !props.board.get(vertex)
        ) {
          ghostStoneMap.value[y][x] = {
            sign: props.player,
            type: null,
            faint: true
          };
        }
      });
    };

    const removeGhostStone = (vertex: Vertex) => {
      const [x, y] = vertex;
      ghostStoneMap.value[y][x] = null;
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
<style lang="scss"></style>
