<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      For a guide and recipes on how to configure / customize this project,
      <br />check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener"
        >vue-cli documentation</a
      >.
    </p>
    <h3>Installed CLI Plugins</h3>
    <Goban
      :sign-map="signMap"
      :lines="lines"
      :heat-map="heatMap"
      :vertex-size="'1cm'"
    />
    <ul>
      <li>
        <a
          href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-typescript"
          target="_blank"
          rel="noopener"
          >typescript</a
        >
      </li>
    </ul>
    <h3>Essential Links</h3>
    <ul>
      <li>
        <a href="https://vuejs.org" target="_blank" rel="noopener">Core Docs</a>
      </li>
      <li>
        <a href="https://forum.vuejs.org" target="_blank" rel="noopener"
          >Forum</a
        >
      </li>
      <li>
        <a href="https://chat.vuejs.org" target="_blank" rel="noopener"
          >Community Chat</a
        >
      </li>
      <li>
        <a href="https://twitter.com/vuejs" target="_blank" rel="noopener"
          >Twitter</a
        >
      </li>
      <li>
        <a href="https://news.vuejs.org" target="_blank" rel="noopener">News</a>
      </li>
    </ul>
    <h3>Ecosystem</h3>
    <ul>
      <li>
        <a href="https://router.vuejs.org" target="_blank" rel="noopener"
          >vue-router</a
        >
      </li>
      <li>
        <a href="https://vuex.vuejs.org" target="_blank" rel="noopener">vuex</a>
      </li>
      <li>
        <a
          href="https://github.com/vuejs/vue-devtools#vue-devtools"
          target="_blank"
          rel="noopener"
          >vue-devtools</a
        >
      </li>
      <li>
        <a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener"
          >vue-loader</a
        >
      </li>
      <li>
        <a
          href="https://github.com/vuejs/awesome-vue"
          target="_blank"
          rel="noopener"
          >awesome-vue</a
        >
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Goban from "./GoBoard/ShudanPort/Goban.vue";
import type { HeatVertex, LineMarker, Sign } from "./GoBoard/ShudanPort/types";

export default defineComponent({
  name: "HelloWorld",
  components: { Goban },
  props: {
    msg: {
      type: String,
      default: "Welcome to Your Vue.js App"
    }
  },
  setup() {
    const signMap: Sign[][] = [
      [0, 0, 1, 0, -1, -1, 1, 0, 0],
      [1, 0, 1, -1, -1, 1, 1, 1, 0],
      [0, 0, 1, -1, 0, 1, -1, -1, 0],
      [1, 1, 1, -1, -1, -1, 1, -1, 0],
      [1, -1, 1, 1, -1, 1, 1, 1, 0],
      [-1, -1, -1, -1, -1, 1, 0, 0, 0],
      [0, -1, -1, 0, -1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, -1, -1, -1, 1],
      [0, 0, 0, 0, 0, 0, 0, -1, 0]
    ];
    const lines = [
      {
        v1: [0, 0],
        v2: [4, 6],
        type: "arrow"
      } as LineMarker
    ];
    const heatMap: HeatVertex[][] = [
      [
        { strength: 9, text: "85.7" },
        { strength: 9, text: "85.7" },
        { strength: 0 },
        { strength: 9, text: "85.7" },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 9, text: "85.7" },
        { strength: 0 }
      ],
      [
        { strength: 0 },
        { strength: 5, text: "55.7" },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 }
      ],
      [
        { strength: 9, text: "85.7" },
        { strength: 9, text: "85.7" },
        { strength: 0 },
        { strength: 0 },
        { strength: 9, text: "85.7" },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 }
      ],
      [
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 }
      ],
      [
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 }
      ],
      [
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 9, text: "85.7" },
        { strength: 9, text: "85.7" },
        { strength: 0 }
      ],
      [
        { strength: 9, text: "85.7" },
        { strength: 0 },
        { strength: 0 },
        { strength: 9, text: "85.7" },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 }
      ],
      [
        { strength: 9, text: "85.7" },
        { strength: 9, text: "85.7" },
        { strength: 0 },
        { strength: 9, text: "85.7" },
        { strength: 9, text: "85.7" },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 }
      ],
      [
        { strength: 9, text: "85.7" },
        { strength: 9, text: "85.7" },
        { strength: 0 },
        { strength: 9, text: "85.7" },
        { strength: 9, text: "85.7" },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 },
        { strength: 0 }
      ]
    ];
    return { signMap, lines, heatMap };
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
