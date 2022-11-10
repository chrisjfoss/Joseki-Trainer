<script lang="ts">
import { computed, defineComponent } from "vue";

export default defineComponent({
  name: "TrainingStats",
  props: {
    numberCorrect: {
      type: Number,
      required: true
    },
    numberIncorrect: {
      type: Number,
      required: true
    },
    numberRemaining: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const base = computed(() => {
      return Math.max(
        props.numberCorrect + props.numberRemaining,
        props.numberIncorrect + props.numberRemaining
      );
    });

    const percentageCorrect = computed(() => {
      return Math.round((props.numberCorrect / base.value) * 100);
    });

    const percentageIncorrect = computed(() => {
      return Math.round((props.numberIncorrect / base.value) * 100);
    });

    const percentageRemaining = computed(() => {
      return Math.round((props.numberRemaining / base.value) * 100);
    });

    return {
      percentageCorrect,
      percentageIncorrect,
      percentageRemaining
    };
  }
});
</script>
<template>
  <div id="stats" class="stats">
    <span class="stats__label">Correct</span>
    <span class="stats__label">Incorrect</span>
    <span class="stats__label">Remaining</span>
    <div class="correct-bar">
      {{ numberCorrect }}
      <div
        class="correct-bar__fill"
        :style="{ height: `${percentageCorrect}%` }"
      ></div>
    </div>
    <div class="incorrect-bar">
      {{ numberIncorrect }}
      <div
        class="incorrect-bar__fill"
        :style="{ height: `${percentageIncorrect}%` }"
      ></div>
    </div>
    <div class="remaining-bar">
      {{ numberRemaining }}
      <div
        class="remaining-bar__fill"
        :style="{ height: `${percentageRemaining}%` }"
      ></div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.stats {
  border: 1px solid var(--text);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: min-content 1fr;
  column-gap: 1rem;
  justify-content: center;
  align-items: flex-end;
  width: 100%;
  height: 100%;
  color: var(--text);
  &__label {
    align-self: flex-start;
  }
  .correct-bar {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    height: 100%;
    &__fill {
      background-color: var(--success);
    }
  }
  .incorrect-bar {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    height: 100%;
    &__fill {
      background-color: var(--error);
    }
  }
  .remaining-bar {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    height: 100%;
    &__fill {
      background-color: var(--warning);
    }
  }
}
</style>
