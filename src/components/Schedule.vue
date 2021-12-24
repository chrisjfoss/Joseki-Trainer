<template>
  <div id="schedule" class="schedule">
    <div v-for="group in moveCountBySessionDate" :key="group[0]" class="schedule__entry">
      <div class="schedule__entry--date">{{ new Date(group[0]).toISOString() }}</div>
      <div class="schedule__entry--count">{{ group[1] }}</div>
    </div>
  </div>
</template>
<script lang="ts">import { MoveApi } from "@/api";
import { defineComponent, onMounted, ref } from "vue";


export default defineComponent({
  name: "Schedule",
  setup() {
    const moveCountBySessionDate = ref(new Map<number, number>());
    onMounted(async () => {
      moveCountBySessionDate.value = await MoveApi.getMoveCountBySessionDate();
      console.log(moveCountBySessionDate.value);
    });
    return {
      moveCountBySessionDate
    };
  }
})
</script>
<style lang="scss">
.schedule__entry {
  &--date {
    color: var(--text);
  }
  &--count {
    color: var(--text);
  }
  display: flex;
}
</style>