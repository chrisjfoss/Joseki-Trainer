<template>
  <q-card dark id="candidates-display" class="candidates-display">
    <q-card-section class="candidates-display__header">
      Candidate Moves
    </q-card-section>
  <q-separator color="accent" dark inset/>
    <q-card-section class="candidates-display__moves">
      <div
        v-for="(candidate, i) in candidates"
        :key="i"
        class="candidates-display__move"
      >
        {{ getMoveDisplay(candidate, i) }}
      </div>
    </q-card-section>
  </q-card>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import { type DatabaseTypes } from "@/database";
import { alpha } from "./GoBoard/ShudanPort/helper";
import { MoveUtil } from "@/utils";

export default defineComponent({
  name: "CandidateMoveDisplay",
  props: {
    position: {
      type: Object as () => DatabaseTypes.Position,
      required: false,
      default: null
    },
    dimensions: {
      type: Object as () => {
        rows: number;
        columns: number;
      },
      required: true
    }
  },
  setup(props) {
    const candidates = computed(() => {
      return props.position?.candidateMoves ?? [];
    });
    const getVertexName = (vertex: { x: number; y: number }) => {
      if (!vertex) {
        return "";
      }
      return `${alpha[vertex.x]}${props.dimensions.rows - vertex.y}`;
    };
    const getMoveDisplay = (candidate: DatabaseTypes.Move, index: number) => {
      let display = `${index + 1}.`;
      if (MoveUtil.isTenuki(candidate)) {
        return `${index + 1}.Tenuki`;
      }
      display += getVertexName(candidate.point);
      if (candidate.comments) {
        display += `: ${candidate.comments}`;
      }
      return display;
    };
    return {
      candidates: candidates,
      getMoveDisplay
    };
  }
});
</script>
<style lang="scss" scoped>
.candidates-display {
  padding: 0;
  background-color: var(--primary);
  color: var(--text);

  &__moves {
    display: grid;
    gap: 1rem;
  }
  &__header {
    font-size: 1.5rem;
    padding: 1rem;
    font-weight: normal;
    text-align: center;
    margin: 0;
  }
}
</style>
