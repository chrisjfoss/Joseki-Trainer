<template>
  <div class="statistics-page">
    <div class="statistics">
      <h2 class="statistics__header">Upcoming Problems</h2>
      <div
        v-for="info in allMoveCountsBySessionDate"
        :key="info.database"
        class="statistics__section"
      >
        <h3>{{ info.database }}</h3>
        <div
          v-for="moveInfo in info.moveCounts"
          :key="moveInfo[0]"
          class="section-date"
        >
          <span>{{ new Date(moveInfo[0]).toLocaleDateString() }}</span>
          <span>{{ moveInfo[1] }} Problems</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, inject, onMounted, Ref, ref, watch } from "vue";
import { MoveApi } from "@/database";

export default defineComponent({
  name: "StatisticsPage",
  setup() {
    const allMoveCountsBySessionDate: Ref<
      { database: string; moveCounts: [number, number][] }[]
    > = ref([]);
    onMounted(async () => {
      allMoveCountsBySessionDate.value =
        await MoveApi.getAllMoveCountsBySessionDate();
    });
    const refetchDatabaseInfo = inject("refetchDatabaseInfo") as Ref<boolean>;

    watch(
      refetchDatabaseInfo,
      async () => {
        allMoveCountsBySessionDate.value =
          await MoveApi.getAllMoveCountsBySessionDate();
      },
      {
        immediate: true
      }
    );

    return {
      allMoveCountsBySessionDate
    };
  }
});
</script>
<style lang="scss" scoped>
.statistics-page {
  margin: 0 1rem;
  display: grid;
  gap: 1rem;
}
.statistics {
  color: var(--text);
  background: var(--primary);
  padding: 1rem;
}
.section-date {
  display: grid;
  grid-template-columns: max-content max-content;
  grid-gap: 1rem;
  width: 100%;
}
</style>
