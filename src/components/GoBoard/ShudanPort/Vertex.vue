<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import type { CSSProperties } from "vue";
import classnames from "classnames";
import { vertexEvents } from "./helper";
import type { Marker, GhostStone, HeatVertex } from "./types";

export default defineComponent({
  props: {
    position: {
      type: Array as PropType<Array<number>>,
      default: () => []
    },
    shift: {
      type: Number,
      default: 0
    },
    random: {
      type: Number,
      default: 0
    },
    sign: {
      type: Number,
      default: 0
    },
    heat: {
      type: Object as () => HeatVertex | null,
      default: () => null
    },
    paint: {
      type: Number,
      default: 0
    },
    marker: {
      type: Object as () => Marker | null,
      default: () => null
    },
    ghostStone: {
      type: Object as () => GhostStone | null,
      default: null
    },
    dimmed: Boolean,
    animate: Boolean,
    selected: Boolean,
    selectedLeft: Boolean,
    selectedRight: Boolean,
    selectedTop: Boolean,
    selectedBottom: Boolean
  },
  setup(props, context) {
    const vertexClasses = computed(() => {
      return classnames(
        `shudan-random_${props.random}`,
        `shudan-sign_${props.sign}`,

        {
          [`shudan-shift_${props.shift}`]: !!props.shift,
          [`shudan-heat_${!!props.heat && props.heat.strength}`]: !!props.heat,
          [`shudan-paint_${props.paint > 0 ? 1 : -1}`]: !!props.paint,
          "shudan-dimmed": props.dimmed,
          "shudan-selected": props.selected,
          "shudan-selectedleft": props.selectedLeft,
          "shudan-selectedright": props.selectedRight,
          "shudan-selectedtop": props.selectedTop,
          "shudan-selectedbottom": props.selectedBottom,
          "shudan-animate": props.animate
        },

        props.marker &&
          props.marker.type &&
          `shudan-marker_${props.marker.type}`,
        props.marker &&
          props.marker.type === "label" &&
          props.marker.label &&
          (props.marker.label.includes("\n") ||
            props.marker.label.length >= 3) &&
          `shudan-smalllabel`,

        props.ghostStone && `shudan-ghost_${props.ghostStone.sign}`,
        props.ghostStone &&
          props.ghostStone.type &&
          `shudan-ghost_${props.ghostStone.type}`,
        props.ghostStone && props.ghostStone.faint && `shudan-ghost_faint`
      );
    });

    const handler = (eventName: string) => (e: unknown) => {
      context.emit(eventName, e);
    };

    const vertexEventHandlers = computed(() => {
      return vertexEvents.map((eventName) => ({
        [eventName.toLowerCase()]: handler(eventName)
      }));
    });

    const absoluteStyle = (zIndex?: number): CSSProperties => ({
      position: "absolute",
      zIndex: zIndex
    });

    const paintOpacity = computed(() => {
      return Math.abs(props.paint || 0) * 0.5;
    });

    return {
      absoluteStyle,
      classnames,
      vertexClasses,
      vertexEventHandlers,
      handler,
      paintOpacity
    };
  }
});
</script>
<template>
  <div
    :data-x="position ? position[0] : null"
    :data-y="position ? position[1] : null"
    class="shudan-vertex"
    :class="vertexClasses"
    v-on="vertexEventHandlers"
  >
    <div
      v-if="!sign && !!marker"
      class="shudan-marker"
      :title="marker.label ?? undefined"
      :style="absoluteStyle(0)"
    ></div>
    <div
      v-if="!sign && !!ghostStone"
      class="shudan-ghost"
      :style="absoluteStyle(1)"
    ></div>
    <div class="shudan-stone" :style="absoluteStyle(2)">
      <div v-if="!!sign" class="shudan-shadow" :style="absoluteStyle()"></div>
      <div
        v-if="!!sign"
        :class="
          classnames(
            'shudan-inner',
            'shudan-stone-image',
            `shudan-random_${random}`,
            `shudan-sign_${sign}`
          )
        "
        :style="absoluteStyle()"
      >
        {{ sign }}
      </div>
      <div
        v-if="!!marker"
        class="shudan-marker"
        :title="marker.label ?? undefined"
        :style="absoluteStyle()"
      ></div>
    </div>
    <div
      v-if="!!paint"
      class="shudan-paint"
      :style="{ ...absoluteStyle(3), opacity: paintOpacity }"
    ></div>
    <div
      v-if="!!selected"
      class="shudan-selection"
      :style="{ ...absoluteStyle(4) }"
    ></div>
    <div class="shudan-heat" :style="absoluteStyle(5)"></div>
    <div v-if="!!heat" class="shudan-heatlabel" :style="absoluteStyle(6)">
      {{ heat.text && heat.text.toString() }}
    </div>
  </div>
</template>
<style lang="scss">
.shudan-vertex {
  position: relative;

  div {
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
}

.shudan-vertex .shudan-stone {
  top: 0.04em;
  left: 0.04em;
  width: calc(100% - 0.08em);
  height: calc(100% - 0.08em);
}
.shudan-vertex.shudan-sign_0 .shudan-stone {
  pointer-events: none;
}
.shudan-vertex .shudan-shadow {
  border-radius: 50%;
}
.shudan-vertex .shudan-inner {
  text-indent: -9999rem;
}
.shudan-vertex:not(.shudan-sign_0).shudan-dimmed .shudan-stone {
  opacity: 0.6;
}
.shudan-vertex:not(.shudan-sign_0) .shudan-shadow {
  background: rgba(23, 10, 2, 0.4);
  box-shadow: 0 0.1em 0.2em rgba(23, 10, 2, 0.4);
}
.shudan-stone-image {
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
.shudan-stone-image.shudan-sign_1 {
  background-image: url("../../../assets/images/stone_1.png");
}
.shudan-stone-image.shudan-sign_-1 {
  background-image: url("../../../assets/images/stone_-1.png");
}

/* Fuzzy stone placement */

.shudan-vertex:not(.shudan-sign_0).shudan-animate .shudan-stone {
  transition: transform 0.2s;
}
.shudan-vertex:not(.shudan-sign_0).shudan-shift_1 .shudan-stone {
  transform: translate(-0.07em, 0);
}
.shudan-vertex:not(.shudan-sign_0).shudan-shift_2 .shudan-stone {
  transform: translate(0, -0.07em);
}
.shudan-vertex:not(.shudan-sign_0).shudan-shift_3 .shudan-stone {
  transform: translate(0.07em, 0);
}
.shudan-vertex:not(.shudan-sign_0).shudan-shift_4 .shudan-stone {
  transform: translate(0, 0.07em);
}
.shudan-vertex:not(.shudan-sign_0).shudan-shift_5 .shudan-stone {
  transform: translate(-0.04em, -0.04em);
}
.shudan-vertex:not(.shudan-sign_0).shudan-shift_6 .shudan-stone {
  transform: translate(0.04em, -0.04em);
}
.shudan-vertex:not(.shudan-sign_0).shudan-shift_7 .shudan-stone {
  transform: translate(0.04em, 0.04em);
}
.shudan-vertex:not(.shudan-sign_0).shudan-shift_8 .shudan-stone {
  transform: translate(-0.04em, 0.04em);
}

/* Markers */

.shudan-vertex .shudan-marker {
  left: 0;
  top: 0;
  text-align: center;
}
.shudan-vertex .shudan-marker::before,
.shudan-vertex .shudan-marker::after {
  box-sizing: border-box;
  content: "";
  display: none;
  position: absolute;
  left: 50%;
  top: 50%;
  border: 0.07em solid var(--shudan-board-foreground-color);
  background: var(--shudan-board-background-color);
  transform: translate(-50%, -50%);
}
.shudan-vertex.shudan-sign_1 .shudan-marker::before,
.shudan-vertex.shudan-sign_1 .shudan-marker::after {
  background: transparent;
  border-color: var(--shudan-black-foreground-color);
  color: var(--shudan-black-foreground-color);
}
.shudan-vertex.shudan-sign_-1 .shudan-marker::before,
.shudan-vertex.shudan-sign_-1 .shudan-marker::after {
  background: transparent;
  border-color: var(--shudan-white-foreground-color);
  color: var(--shudan-white-foreground-color);
}

.shudan-vertex.shudan-marker_point .shudan-marker {
  left: 50%;
  top: 50%;
  width: 0.3em;
  height: 0.3em;
  border-radius: 50%;
  background: var(--shudan-board-foreground-color);
  transform: translate(-50%, -50%);
}
.shudan-vertex.shudan-marker_point.shudan-sign_1 .shudan-marker {
  background: var(--shudan-black-foreground-color);
}
.shudan-vertex.shudan-marker_point.shudan-sign_-1 .shudan-marker {
  background: var(--shudan-white-foreground-color);
}

.shudan-vertex.shudan-marker_square .shudan-marker::before,
.shudan-vertex.shudan-marker_circle .shudan-marker::before,
.shudan-vertex.shudan-marker_loader .shudan-marker::before {
  display: block;
  width: 0.5em;
  height: 0.5em;
}
.shudan-vertex.shudan-marker_circle .shudan-marker::before,
.shudan-vertex.shudan-marker_loader .shudan-marker::before {
  border-radius: 50%;
}
.shudan-vertex.shudan-marker_loader .shudan-marker::before {
  border-left-color: transparent;
  border-top-color: transparent;
  animation: 1.5s linear 0s shudan-rotation infinite;
}

@keyframes shudan-rotation {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.shudan-vertex.shudan-marker_cross .shudan-marker {
  width: 0.7em;
  height: 0.7em;
  left: 50%;
  top: 50%;
  background: var(--shudan-board-background-color);
  transform: translate(-50%, -50%);
}
.shudan-vertex.shudan-marker_cross.shudan-sign_1 .shudan-marker,
.shudan-vertex.shudan-marker_cross.shudan-sign_-1 .shudan-marker {
  background: transparent;
}
.shudan-vertex.shudan-marker_cross .shudan-marker::before,
.shudan-vertex.shudan-marker_cross .shudan-marker::after {
  display: block;
  border-width: 0.07em 0 0 0;
  width: 0.7em;
  height: 0;
  transform: translate(-0.35em, -0.035em) rotate(45deg);
}
.shudan-vertex.shudan-marker_cross .shudan-marker::after {
  transform: translate(-0.35em, -0.035em) rotate(-45deg);
}

.shudan-vertex.shudan-marker_triangle .shudan-marker::before {
  display: block;
  border-top: none;
  border-left: 0.3em solid transparent;
  border-right: 0.3em solid transparent;
  border-bottom: 0.5em solid;
  background: none;
}
.shudan-vertex.shudan-marker_triangle .shudan-marker::after {
  display: block;
  border-top: none;
  border-left: 0.18em solid transparent;
  border-right: 0.18em solid transparent;
  border-bottom: 0.3em solid var(--shudan-board-background-color);
  transform: translate(-0.18em, -0.12em);
  background: none;
}
.shudan-vertex.shudan-marker_triangle.shudan-sign_1 .shudan-marker::after {
  border-bottom-color: var(--shudan-black-background-color);
}
.shudan-vertex.shudan-marker_triangle.shudan-sign_-1 .shudan-marker::after {
  border-bottom-color: var(--shudan-white-background-color);
}

.shudan-vertex.shudan-marker_label .shudan-marker::before {
  content: attr(title);
  display: inline-block;
  border: none;
  max-height: 1.67em;
  max-width: 1.67em;
  overflow: hidden;
  font-size: 0.6em;
  line-height: 1.26;
  text-align: center;
  text-overflow: ellipsis;
  white-space: pre;
}
.shudan-vertex.shudan-smalllabel .shudan-marker::before {
  max-height: 2.7em;
  max-width: 2.7em;
  font-size: 0.36em;
}
.shudan-vertex.shudan-marker_label:not(.shudan-smalllabel) .shudan-marker {
  pointer-events: none;
}

/* Ghost stones */

.shudan-vertex .shudan-ghost {
  left: 50%;
  top: 50%;
  width: 0.4em;
  height: 0.4em;
  opacity: 0.5;
  transform: translate(calc(-50% + 0.5px), calc(-50% + 0.5px));
}
.shudan-vertex .shudan-ghost::before {
  content: "";
  box-sizing: border-box;
  display: none;
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0.4em;
  height: 0.4em;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
.shudan-vertex.shudan-ghost_faint .shudan-ghost {
  opacity: 0.3;
}
.shudan-vertex.shudan-sign_0.shudan-ghost_1 .shudan-ghost::before,
.shudan-vertex.shudan-sign_0.shudan-ghost_-1 .shudan-ghost::before {
  display: block;
}
.shudan-vertex.shudan-ghost_1 .shudan-ghost::before {
  background: rgba(0, 0, 0, 0.8);
}
.shudan-vertex.shudan-ghost_-1 .shudan-ghost::before {
  background: white;
}
.shudan-vertex.shudan-ghost_good .shudan-ghost::before {
  background: #59a80f;
}
.shudan-vertex.shudan-ghost_interesting .shudan-ghost::before {
  background: #4886d5;
}
.shudan-vertex.shudan-ghost_doubtful .shudan-ghost::before {
  background: #92278f;
}
.shudan-vertex.shudan-ghost_bad .shudan-ghost::before {
  background: #f02311;
}

/* Paint map */

.shudan-vertex.shudan-paint_1 .shudan-paint {
  background: var(--shudan-black-background-color);
}
.shudan-vertex.shudan-paint_-1 .shudan-paint {
  background: var(--shudan-white-background-color);
}

/* Heat map */

.shudan-vertex .shudan-heat {
  top: 50%;
  left: 50%;
  margin-left: -1px;
  margin-top: -1px;
  border-radius: 50%;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s, box-shadow 0.5s;
}
.shudan-vertex.shudan-heat_9 .shudan-heat {
  background: #59a80f;
  box-shadow: 0 0 1em 1em #59a80f;
  opacity: 0.8;
}
.shudan-vertex.shudan-heat_8 .shudan-heat {
  background: #59a80f;
  box-shadow: 0 0 1em 0.9em #59a80f;
  opacity: 0.7;
}
.shudan-vertex.shudan-heat_7 .shudan-heat {
  background: #4886d5;
  box-shadow: 0 0 1em 0.75em #4886d5;
  opacity: 0.8;
}
.shudan-vertex.shudan-heat_6 .shudan-heat {
  background: #4886d5;
  box-shadow: 0 0 1em 0.6em #4886d5;
  opacity: 0.8;
}
.shudan-vertex.shudan-heat_5 .shudan-heat {
  background: #4886d5;
  box-shadow: 0 0 0.9em 0.55em #4886d5;
  opacity: 0.7;
}
.shudan-vertex.shudan-heat_4 .shudan-heat {
  background: #92278f;
  box-shadow: 0 0 0.85em 0.5em #92278f;
  opacity: 0.8;
}
.shudan-vertex.shudan-heat_3 .shudan-heat {
  background: #92278f;
  box-shadow: 0 0 0.8em 0.45em #92278f;
  opacity: 0.7;
}
.shudan-vertex.shudan-heat_2 .shudan-heat {
  background: #f02311;
  box-shadow: 0 0 0.75em 0.4em #f02311;
  opacity: 0.8;
}
.shudan-vertex.shudan-heat_1 .shudan-heat {
  background: #f02311;
  box-shadow: 0 0 0.75em 0.4em #f02311;
  opacity: 0.7;
}

.shudan-vertex .shudan-heatlabel {
  display: inline-block;
  height: auto;
  top: 50%;
  left: 50%;
  overflow: hidden;
  color: white;
  font-size: 0.36em;
  line-height: 1.26;
  text-align: center;
  text-overflow: ellipsis;
  text-shadow: 0 0.1em 0.3em black;
  white-space: pre;
  opacity: 0.9;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* Selection */

.shudan-vertex .shudan-selection {
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: auto;
  height: auto;
  border: 0.1em solid #0082f0;
  border-radius: 0.2em;
  background: rgba(0, 130, 240, 0.2);
}
.shudan-vertex.shudan-selectedleft .shudan-selection {
  border-left: none;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.shudan-vertex.shudan-selectedright .shudan-selection {
  border-right: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.shudan-vertex.shudan-selectedtop .shudan-selection {
  border-top: none;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.shudan-vertex.shudan-selectedbottom .shudan-selection {
  border-bottom: none;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
