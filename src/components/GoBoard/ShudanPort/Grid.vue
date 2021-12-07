<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "Grid",
  props: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    xs: {
      type: Array as PropType<number[]>,
      required: true
    },
    ys: {
      type: Array as PropType<number[]>,
      required: true
    },
    hoshis: {
      type: Array as PropType<[any, any][]>,
      required: true
    }
  }
});
</script>
<template>
  <div v-if="xs.length > 0 && ys.length > 0">
    <svg class="shudan-grid">
      <rect
        v-for="(y, i) in ys"
        :key="`h${i}`"
        class="shudan-gridline shudan-horizontal"
        :x="`${xs[0] === 0 ? 0.5 : 0}em`"
        :y="`${(2 * i + 1) * 0.5}em`"
        :width="`${
          xs[xs.length - 1] === width - 1
            ? (2 * xs.length - 1) * 0.5 - (xs[0] === 0 ? 0.5 : 0)
            : xs.length - (xs[0] === 0 ? 0.5 : 0)
        }em`"
        height="1"
      />
      <rect
        v-for="(x, i) in xs"
        :key="`v${i}`"
        class="shudan-gridline shudan-vertical"
        :x="`${(2 * i + 1) * 0.5}em`"
        :y="`${ys[0] === 0 ? 0.5 : 0}em`"
        width="1"
        :height="`${
          ys[ys.length - 1] === height - 1
            ? (2 * ys.length - 1) * 0.5 - (ys[0] === 0 ? 0.5 : 0)
            : ys.length - (ys[0] === 0 ? 0.5 : 0)
        }em`"
      />
      <template v-for="hoshi in hoshis">
        <circle
          v-if="hoshi[0] >= 0 && hoshi[1] >= 0"
          :key="hoshi.join('-')"
          class="shudan-hoshi"
          :cx="`${(2 * xs.indexOf(hoshi[0]) + 1) * 0.5}em`"
          :cy="`${(2 * ys.indexOf(hoshi[1]) + 1) * 0.5}em`"
          :r="'.1em'"
        />
      </template>
    </svg>
  </div>
</template>
<style lang="scss">
.shudan-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
.shudan-gridline,
.shudan-hoshi {
  fill: var(--shudan-board-foreground-color);
}
</style>
