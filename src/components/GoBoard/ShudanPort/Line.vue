<script lang="ts">
import { computed, defineComponent } from "vue";
import { vertexEquals } from "./helper";

export default defineComponent({
  props: {
    v1: {
      type: Object as () => [any, any],
      required: true,
    },
    v2: {
      type: Object as () => [any, any],
      required: true,
    },
    type: {
      type: String,
      default: "line",
    },
    vertexSize: {
      type: [Number, String],
      default: "1.5rem",
    },
  },
  setup(props) {
    const vertexSizeNumber = computed(() =>
      parseFloat(props.vertexSize.toString())
    );
    const vertexSizeUnit = computed(
      () => props.vertexSize.toString().replace(/[0-9.]/g, "") || "rem"
    );
    console.log(vertexSizeNumber.value, vertexSizeUnit.value);
    const [pos1, pos2] = [props.v1, props.v2].map((v) =>
      v.map((x) => x * vertexSizeNumber.value)
    );
    const [dx, dy] = pos1.map((x, i) => pos2[i] - x);
    const [left, top] = pos1.map(
      (x, i) => (x + pos2[i] + vertexSizeNumber.value) / 2
    );

    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const length = Math.sqrt(dx * dx + dy * dy);

    const styles = computed(() => {
      return {
        left: left + vertexSizeUnit.value,
        top: top + vertexSizeUnit.value,
        transform: `translateX(${-length / 2}${
          vertexSizeUnit.value
        }) rotate(${angle}deg)`,
        width: length + vertexSizeUnit.value,
      };
    });
    return {
      vertexEquals,
      styles,
    };
  },
});
</script>
<template>
  <div
    v-if="!vertexEquals(v1, v2)"
    id="shudan-line"
    :class="`shudan-${type}`"
    :style="styles"
  ></div>
</template>
<style scoped lang="scss">
#shudan-line {
  position: absolute;
  margin: 0;
}

.shudan-line,
.shudan-arrow {
  height: 0.11em;
  background: var(--shudan-board-foreground-color);
}

.shudan-arrow::before,
.shudan-arrow::after {
  content: "";
  position: absolute;
  height: 0.11em;
  width: 0.5em;
  left: auto;
  right: 0;
  top: -0.12em;
  background: var(--shudan-board-foreground-color);
  transform: rotate(30deg);
  pointer-events: none;
}
.shudan-arrow::after {
  top: auto;
  bottom: -0.12em;
  transform: rotate(-30deg);
}
</style>
