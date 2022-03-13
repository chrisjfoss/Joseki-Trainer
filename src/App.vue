<template>
  <div class="theme-container theme-light">
    <div class="container">
      <TheHeader />
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, provide, ref } from "vue";
import { DatabaseApi } from "./api";
import TheHeader from "./components/Header.vue";

export default defineComponent({
  name: "App",
  components: {
    TheHeader
  },
  setup() {
    const currentDatabase = ref(DatabaseApi.getCurrentDatabaseName());
    provide("currentDatabase", currentDatabase);
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
