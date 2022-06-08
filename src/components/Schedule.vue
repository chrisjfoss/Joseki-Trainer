<template>
  <div id="schedule" class="schedule">
    <v-calendar :masks="{ weekdays: 'WWW' }" :attributes="calendarAttrs">
      <template #day-popover="{ day, attributes }">
        <div class="schedule__day">
          <div class="schedule__label">{{ day.id }}</div>
          <div class="schedule__data">
            <p
              v-for="attribute in attributes"
              :key="attribute.key"
              class="schedule__text"
            >
              {{ attribute.customData.title }}
            </p>
          </div>
        </div>
      </template>
    </v-calendar>
  </div>
</template>
<script lang="ts">
import { MoveApi } from "@/api";
import { computed, defineComponent, inject, onMounted, ref, watch } from "vue";
import type { Ref } from "vue";

export default defineComponent({
  name: "Schedule",
  setup() {
    const moveCountBySessionDate = ref(new Map<number, number>());
    onMounted(async () => {
      moveCountBySessionDate.value = await MoveApi.getMoveCountBySessionDate();
    });

    const refetchDatabaseInfo = inject("refetchDatabaseInfo") as Ref<boolean>;
    watch(refetchDatabaseInfo, async () => {
      moveCountBySessionDate.value = await MoveApi.getMoveCountBySessionDate();
    });

    const calendarAttrs = computed(() => {
      const returnAttrs = [];
      let i = 0;
      for (const [date, count] of moveCountBySessionDate.value) {
        returnAttrs.push({
          key: i,
          customData: {
            title: `${count} moves to review`
          },
          dot: {
            class: "primary"
          },
          popover: {
            visibility: "hover",
            hideIndicator: false
          },
          dates: new Date(date)
        });
        ++i;
      }
      return returnAttrs;
    });
    return {
      calendarAttrs
    };
  }
});
</script>
<style lang="scss">
.schedule {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(2, 1fr);

  &--date {
    color: var(--text);
  }
  &--count {
    color: var(--text);
  }
  display: flex;
}
</style>
