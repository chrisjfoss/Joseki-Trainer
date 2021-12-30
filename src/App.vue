<template>
  <div class="theme-container theme-light">
    <div class="container">
      <TheHeader />
      <router-view></router-view>
    </div>
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

#app .theme-container {
  background-color: var(--background);
  min-height: 100vh;
}
</style>
