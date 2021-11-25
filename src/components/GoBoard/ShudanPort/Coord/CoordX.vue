<script scoped lang="ts">
import { defineComponent } from "vue";
import { alpha } from "../helper";

export default defineComponent({
  name: "CoordX",
  props: {
    style: {
      type: Object,
      default: () => {}
    },
    xs: {
      type: Array,
      default: () => []
    },
    coordX: {
      type: [Number, String],
      required: false,
      default: 0
    }
  },
  setup() {
    const defaultCoordText = (i: number) => {
      return alpha[i] || alpha[alpha.length - 1];
    };
    return {
      defaultCoordText
    };
  }
});
</script>
<template>
  <div class="shudan-coord-container" :style="style">
    <div v-for="(x, i) in xs" :key="i" class="shudan-coord">
      {{ coordX ?? defaultCoordText(i) }}
    </div>
  </div>
</template>
<style scoped lang="scss">
.shudan-coord-container {
  display: flex;
  text-align: center;
}
.shudan-coord {
  display: block;
  width: 2.5em;
  font-size: 0.6em;
}
</style>
