<template>
  <div class="statistics-page">
    <Schedule />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import Schedule from "@/components/Schedule.vue";

export default defineComponent({
  name: "StatisticsPage",
  components: {
    Schedule
  }
});
</script>
<style lang="scss" scoped>
.statistics-page {
  margin: 0 1rem;
  display: grid;
  gap: 1rem;
}
</style>
