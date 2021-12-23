<template>
  <div class="container theme-light">
    <TheHeader />
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TheHeader from "./components/Header.vue";

export default defineComponent({
  name: "App",
  components: {
    TheHeader
  }
});
</script>

<style lang="scss">
#app .container {
  display: grid;
  gap: 1rem;
}

body {
  background-color: var(--background);
}
</style>
