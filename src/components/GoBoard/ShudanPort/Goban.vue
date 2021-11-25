<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  ref,
  watch,
  watchEffect
} from "vue";
import type { CSSProperties, HTMLAttributes } from "vue";
import classnames from "classnames";
import helper from "./helper";
import { CoordX, CoordY } from "./Coord";
import Grid from "./Grid.vue";
import Vertex from "./Vertex.vue";
import Line from "./Line.vue";
import type {
  Map,
  Sign,
  Vertex as VertexType,
  Marker,
  GhostStone,
  HeatVertex,
  LineMarker
} from "./types";

export default defineComponent({
  name: "Goban",
  components: { CoordX, CoordY, Grid, Vertex, Line },
  props: {
    id: {
      type: String,
      default: ""
    },
    class: {
      type: String,
      default: ""
    },
    className: {
      type: String,
      default: ""
    },
    style: {
      type: Object as PropType<CSSProperties>,
      default: () => {}
    },
    busy: Boolean,
    vertexSize: {
      type: [Number, String],
      default: "1.5rem"
    },
    innerProps: {
      type: Object as PropType<HTMLAttributes>,
      default: () => {}
    },
    showCoordinates: {
      type: Boolean,
      default: false
    },
    coordX: {
      type: [Number, String],
      default: ""
    },
    coordY: {
      type: [Number, String],
      default: ""
    },
    signMap: {
      type: Array as PropType<Sign[][]>,
      required: false,
      default: () => []
    },
    markerMap: {
      type: Array as PropType<Map<Marker | null>>,
      required: false,
      default: () => []
    },
    paintMap: {
      type: Array as PropType<Map<0 | 1 | -1>>,
      required: false,
      default: () => []
    },
    ghostStoneMap: {
      type: Array as PropType<Map<GhostStone | null>>,
      required: false,
      default: () => []
    },
    heatMap: {
      type: Array as PropType<Map<HeatVertex | null>>,
      required: false,
      default: () => []
    },
    selectedVertices: {
      type: Array as PropType<VertexType[]>,
      default: () => []
    },
    dimmedVertices: {
      type: Array as PropType<VertexType[]>,
      default: () => []
    },
    lines: {
      type: Object as PropType<LineMarker[]>,
      default: () => {}
    },
    fuzzyStonePlacement: {
      type: Boolean,
      default: false
    },
    animateStonePlacement: {
      type: Boolean,
      default: true
    },
    animationDuration: {
      type: Number,
      default: 200
    },
    rangeX: {
      type: Array as () => number[],
      required: false,
      default: () => [0, Infinity]
    },
    rangeY: {
      type: Array as () => number[],
      required: false,
      default: () => [0, Infinity]
    }
  },
  setup(props, context) {
    const width = computed(() => {
      return props.signMap.length === 0 ? 0 : props.signMap[0].length;
    });
    const height = computed(() => {
      return props.signMap.length;
    });
    const hoshis = computed(() => {
      return helper.getHoshis(width.value, height.value);
    });
    const xs = computed(() => {
      return helper
        .range(width.value)
        .slice(props.rangeX[0], props.rangeX[1] + 1);
    });
    const ys = computed(() => {
      return helper
        .range(height.value)
        .slice(props.rangeY[0], props.rangeY[1] + 1);
    });
    const reactiveSignMap = computed(() => {
      return props.signMap;
    });
    const computedVertexSize = computed(() => {
      const numericValue = props.vertexSize.toString().replace(/[^0-9.]/g, "");
      const unit = props.vertexSize.toString().replace(/[0-9.]/g, "") || "rem";
      return `${numericValue}${unit}`;
    });

    let clearAnimatedVerticesHandler: unknown | null = null;

    const animatedVertices = ref([] as Array<[number, number]>);
    const shiftMap = ref(
      helper.readjustShifts(
        props.signMap.map((row) => row.map(() => helper.random(8)))
      )
    );
    const randomMap = ref(
      props.signMap.map((row) => row.map(() => helper.random(4)))
    );

    watchEffect(() => {
      if (
        props.animateStonePlacement &&
        clearAnimatedVerticesHandler &&
        animatedVertices.value.length > 0
      ) {
        // Handle stone animation
        const newShiftMap = shiftMap.value;
        for (let [x, y] of animatedVertices.value) {
          newShiftMap[y][x] = helper.random(7) + 1;
          helper.readjustShifts(newShiftMap, [x, y]);
        }
        shiftMap.value = newShiftMap;
        // Clear animation classes
        clearAnimatedVerticesHandler = setTimeout(() => {
          animatedVertices.value = [];
          clearAnimatedVerticesHandler = null;
        }, props.animationDuration);
      }
    });

    watch(reactiveSignMap, (current, previous) => {
      if (
        props.animateStonePlacement &&
        props.fuzzyStonePlacement &&
        clearAnimatedVerticesHandler == null
      ) {
        animatedVertices.value = helper.diffSignMap(previous, current);
      }
    });

    watch([width, height], (current, previous) => {
      if (current[0] !== previous[0] || current[1] !== previous[1]) {
        animatedVertices.value = [];
        clearAnimatedVerticesHandler = null;
        shiftMap.value = helper.readjustShifts(
          props.signMap.map((row) => row.map(() => helper.random(8)))
        );
        randomMap.value = props.signMap.map((row) =>
          row.map(() => helper.random(4))
        );
      }
    });

    const animatedVerticesNeighborhoodMap = computed(() => {
      return ([] as Array<[number, number]>).concat(
        ...animatedVertices.value.map(helper.neighborhood)
      );
    });

    const dynamicClasses = computed(() => {
      return (
        classnames({
          "shudan-busy": props.busy,
          "shudan-coordinates": props.showCoordinates
        }) +
        " " +
        (context.attrs.class || context.attrs.className || "")
      );
    });

    const vertexHandler = (eventName: string) => (e: unknown) => {
      context.emit("onVertex" + eventName, e);
    };

    return {
      animatedVerticesNeighborhoodMap,
      dynamicClasses,
      helper,
      vertexHandler,
      xs,
      ys,
      width,
      height,
      hoshis,
      shiftMap,
      randomMap,
      computedVertexSize
    };
  }
});
</script>
<template>
  <div
    id="id"
    class="shudan-goban shudan-goban-image"
    :class="dynamicClasses"
    :style="{
      'font-size': `${computedVertexSize}`,
      '--goban-horizontal-length': xs.length,
      '--goban-vertical-length': ys.length,
      ...style,
    } as Record<string, unknown>"
  >
    <CoordX
      v-if="showCoordinates"
      :xs="xs"
      :coord-x="coordX"
      :style="{ 'grid-row': 1, 'grid-column': 2 }"
    />
    <CoordY
      v-if="showCoordinates"
      :height="height"
      :ys="ys"
      :coord-y="coordY"
      :style="{ 'grid-row': 2, 'grid-column': 1 }"
    />
    <div class="shudan-content">
      <Grid
        :width="width"
        :height="height"
        :xs="xs"
        :ys="ys"
        :hoshis="hoshis"
      />
      <div class="shudan-vertices">
        <template v-for="y in ys">
          <Vertex
            v-for="x in xs"
            :key="[x, y].join('-')"
            :position="[x, y]"
            :shift="
              fuzzyStonePlacement
                ? helper.getValueAtVertex(shiftMap, [x, y])
                : 0
            "
            :random="helper.getValueAtVertex(randomMap, [x, y])"
            :sign="helper.getValueAtVertex(signMap, [x, y])"
            :heat="helper.getValueAtVertex(heatMap, [x, y], null)"
            :paint="helper.getValueAtVertex(paintMap, [x, y])"
            :marker="helper.getValueAtVertex(markerMap, [x, y], null)"
            :ghost-stone="helper.getValueAtVertex(ghostStoneMap, [x, y], null)"
            :dimmed="helper.hasVertex(dimmedVertices, [x, y])"
            :animate="helper.hasVertex(animatedVerticesNeighborhoodMap, [x, y])"
            :selected="helper.hasVertex(selectedVertices, [x, y])"
            :selected-left="
              helper.hasVertex(selectedVertices, [x, y]) &&
              helper.hasVertex(selectedVertices, [x - 1, y])
            "
            :selected-right="
              helper.hasVertex(selectedVertices, [x, y]) &&
              helper.hasVertex(selectedVertices, [x + 1, y])
            "
            :selected-top="
              helper.hasVertex(selectedVertices, [x, y]) &&
              helper.hasVertex(selectedVertices, [x, y - 1])
            "
            :selected-bottom="
              helper.hasVertex(selectedVertices, [x, y]) &&
              helper.hasVertex(selectedVertices, [x, y + 1])
            "
            v-on="
              helper.vertexEvents.map((e) => ({
                [e]: vertexHandler(e)
              }))
            "
          />
        </template>
        <div class="shudan-lines">
          <div
            :style="{
              position: 'absolute',
              top: `-${rangeY[0]}em`,
              left: `-${rangeX[0]}em`,
              width: `${width}em`,
              height: `${height}em`
            }"
          >
            <Line
              v-for="(line, i) in lines"
              :key="i"
              :v1="line.v1"
              :v2="line.v2"
              :type="line.type"
              :vertex-size="vertexSize"
            />
          </div>
        </div>
      </div>
    </div>
    <CoordY
      v-if="showCoordinates"
      :height="height"
      :ys="ys"
      :coord-y="coordY"
      :style="{ 'grid-row': 2, 'grid-column': 3 }"
    />
    <CoordX
      v-if="showCoordinates"
      :xs="xs"
      :coord-x="coordX"
      :style="{ 'grid-row': 3, 'grid-column': 2 }"
    />
  </div>
</template>
<style lang="scss">
.shudan-goban {
  --shudan-board-border-width: 0.25em;
  --shudan-board-border-color: #ca933a;

  --shudan-board-background-color: #ebb55b;
  --shudan-board-foreground-color: #5e2e0c;

  --shudan-black-background-color: #222;
  --shudan-black-foreground-color: #eee;

  --shudan-white-background-color: #eee;
  --shudan-white-foreground-color: #222;

  position: relative;
  border: var(--shudan-board-border-width) solid
    var(--shudan-board-border-color);
  color: var(--shudan-board-foreground-color);

  display: inline-grid;
  line-height: 1em;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;
  &.shudan-coordinates {
    grid-template-rows: 1em 1fr 1em;
    grid-template-columns: 1em 1fr 1em;
  }
  &::after {
    content: "";
    position: absolute;
    top: calc(-1 * var(--shudan-board-border-width));
    left: calc(-1 * var(--shudan-board-border-width));
    bottom: calc(-1 * var(--shudan-board-border-width));
    right: calc(-1 * var(--shudan-board-border-width));
    background: linear-gradient(
        to bottom,
        rgba(234, 220, 192, 0.1),
        transparent
      ),
      linear-gradient(to bottom, transparent, rgba(23, 10, 2, 0.05));
    pointer-events: none;
    z-index: 3;
  }
  &.shudan-busy::after {
    animation: 2s linear -0.5s shudan-busy infinite;
    background-color: rgba(23, 10, 2, 0.1);
    background-image: linear-gradient(
      to right,
      transparent 30%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 70%
    );
    background-size: 19em 100%;
    background-repeat: no-repeat;
    pointer-events: all;
  }
  @keyframes shudan-busy {
    from {
      background-position: -19em 0;
    }
    to {
      background-position: calc(100% + 19em) 0;
    }
  }
}
.shudan-goban:not(.shudan-coordinates) {
  padding: 0.25em;
}
.shudan-goban-image {
  background: url("../../../assets/images/board.png")
    var(--shudan-board-background-color);
}

.shudan-content {
  position: relative;
  grid-row: 1;
  grid-column: 1;
  .shudan-coordinates & {
    grid-row: 2;
    grid-column: 2;
  }
}
.shudan-vertices {
  display: grid;
  grid-template-columns: repeat(var(--goban-horizontal-length), 1em);
  grid-template-rows: repeat(var(--goban-vertical-length), 1em);
}
.shudan-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 2;
}
</style>
