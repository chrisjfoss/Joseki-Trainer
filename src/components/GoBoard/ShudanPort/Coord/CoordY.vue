<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "CoordY",
  props: {
    style: {
      type: Object,
      default: () => {}
    },
    ys: {
      type: Array,
      default: () => []
    },
    height: {
      type: Number,
      required: true
    },
    coordY: {
      type: [Number, String],
      required: false,
      default: 0
    }
  },
  setup(props) {
    const defaultCoordText = (i: number) => {
      return props.height - i;
    };
    return {
      defaultCoordText
    };
  }
});
</script>
<template>
  <div class="shudan-coord-container" :style="style">
    <div v-for="(y, i) in ys" :key="i" class="shudan-coord">
      <span class="shudan-coord__text">
        {{ coordY || defaultCoordText(i) }}
      </span>
    </div>
  </div>
</template>
<style scoped lang="scss">
.shudan-coord-container {
  text-align: center;
  margin-top: 0.25rem;
}
.shudan-coord {
  height: 1em;
  display: flex;
  justify-content: center;
  &__text {
    font-size: 0.6em;
  }
}
</style>
