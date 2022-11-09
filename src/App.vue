<template>
  <div class="theme-container theme-light">
    <div class="container">
      <TheHeader />
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, provide, Ref, ref, watch } from "vue";
import TheHeader from "@/components/TheHeader";

import { liveQuery } from "dexie";
import { useObservable } from "@vueuse/rxjs";
import { DatabaseCore, DatabaseApi } from "./database";

const apiWindow = window as typeof window & {
  api: {
    send: Function;
    receive: Function;
  };
};

export default defineComponent({
  name: "App",
  components: {
    TheHeader
  },
  setup() {
    onMounted(() => {
      apiWindow.api.receive("export-db", async () => {
        const buffer = await (await DatabaseApi.exportDatabase()).arrayBuffer();
        apiWindow.api.send("export-db-complete", {
          buffer,
          name: DatabaseApi.getCurrentDatabaseName()
        });
      });
      apiWindow.api.receive(
        "import-db",
        async (files: { fileName: string; buffer: Buffer }[][]) => {
          files[0].forEach(async ({ fileName, buffer }) => {
            refetchDatabaseInfo.value = false;
            await DatabaseApi.importDatabase(fileName, new Blob([buffer]));
            refetchDatabaseInfo.value = true;
          });
        }
      );
    });
    const readonlyActiveDatabase = useObservable(
      liveQuery(async () => {
        const repo = await DatabaseCore.repositoryDb.activeRepository.toArray();
        if (repo.length > 0) {
          const name = repo[0].name;
          return name;
        }
        return "default";
      }) as any
    ) as Readonly<Ref<string>>;
    const currentDatabase = ref("");
    const refetchDatabaseInfo = ref(false);
    watch(readonlyActiveDatabase, () => {
      currentDatabase.value = readonlyActiveDatabase.value;
    });
    watch(currentDatabase, async () => {
      refetchDatabaseInfo.value = false;
      await DatabaseApi.switchToDatabase(currentDatabase.value as string);
      refetchDatabaseInfo.value = true;
    });
    // This is the value to change
    provide("currentDatabase", currentDatabase);
    // This is the value to watch
    provide("refetchDatabaseInfo", refetchDatabaseInfo);
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
