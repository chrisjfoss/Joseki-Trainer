<template>
  <div id="schedule" class="schedule">
    <v-calendar :masks="{ weekdays: 'WWW' }" :attributes="calendarAttrs">
      <template #day-content="{ day, attributes }">
        <div class="schedule__day">
          <div class="schedule__label">{{ day.day }}</div>
          <div class="schedule__data">
            <p class="schedule__text">{{ attributes.customData.title }}</p>
          </div>
        </div>
      </template>
    </v-calendar>
  </div>
</template>
<script lang="ts">import { MoveApi } from "@/api";
import { computed, defineComponent, onMounted, ref } from "vue";


export default defineComponent({
  name: "Schedule",
  setup() {
    const moveCountBySessionDate = ref(new Map<number, number>());
    onMounted(async () => {
      moveCountBySessionDate.value = await MoveApi.getMoveCountBySessionDate();
      console.log(moveCountBySessionDate.value);
    });


    const calendarAttrs = computed(() => {
      const returnAttrs = [];
      let i = 0;
      for (const [date, count] of moveCountBySessionDate.value) {
        returnAttrs.push({
          key: i,
          customData: {
            title: `${count} moves`,
          },
          dates: new Date(date),
        })
        ++i;
      }
      return returnAttrs;
    });
    return {
      calendarAttrs
    };
  }
})
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