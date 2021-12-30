<template>
  <div id="candidates-display">
    <h1>Candidate Moves</h1>
    <div class="candidates-display__moves">
      <div
        v-for="(candidate, i) in candidates"
        :key="i"
        class="candidates-display__move"
      >
        {{ candidate[0] + " " + candidate[1] }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from "vue";
import * as DbTypes from "@/db/types";
import { Transformation } from "@/utils/matrixUtil";
import { Matrix } from "@/utils";

export default defineComponent({
  name: "CandidateMoveDisplay",
  props: {
    position: {
      type: Object as () => DbTypes.Position,
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
    const transformedCandidates = computed(() => {
      return (
        props.position?.candidateMoves.map((candidate) => {
          const point = candidate.point;
          return Matrix.getVerticeTransformation(
            [point.x, point.y],
            Transformation.original,
            props.dimensions.columns,
            props.dimensions.rows
          );
        }) ?? []
      );
    });
    return {
      candidates: transformedCandidates
    };
  }
});
</script>
<style lang="scss">
#candidates-display {
  padding: 1rem;
  background-color: var(--primary);
  color: var(--text);

  &__moves {
    display: grid;
    gap: 1rem;
  }
  h1 {
    font-size: 1.5rem;
    font-weight: normal;
    text-align: center;
    margin: 0;
    border-bottom: 1px solid var(--text);
  }
}
</style>
