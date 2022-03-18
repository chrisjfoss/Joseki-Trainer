<template>
  <div class="theme-container theme-light">
    <div class="container">
      <TheHeader />
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, provide } from "vue";
import TheHeader from "./components/Header.vue";

import { liveQuery } from "dexie";
import { useObservable } from "@vueuse/rxjs";
import { repositoryDb } from "./db";
import { switchToDatabase } from "./api/database";
import { DatabaseApi } from "./api";

export default defineComponent({
  name: "App",
  components: {
    TheHeader
  },
  setup() {
    onMounted(() => {
      (window as any).api.receive("export-db", async () => {
        const buffer = await (await DatabaseApi.exportDatabase()).arrayBuffer();
        (window as any).api.send("export-db-complete", {
          buffer,
          name: DatabaseApi.getCurrentDatabaseName()
        });
      });
    });
    const currentDatabase = useObservable(
      liveQuery(async () => {
        const repo = await repositoryDb.activeRepository.toArray();
        if (repo.length > 0) {
          const name = repo[0].name;
          await switchToDatabase(name);
          return name;
        }
        return "default";
      }) as any
    );
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
