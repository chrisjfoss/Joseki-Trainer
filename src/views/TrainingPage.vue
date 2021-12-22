<template>
  Test
  <Header />
  <Train />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Train from "../components/Train.vue";
import Header from "../components/Header.vue";

export default defineComponent({
  name: "TrainingPage",
  components: {
    Header,
    Train
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
