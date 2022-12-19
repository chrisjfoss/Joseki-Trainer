<template>
  <div class="theme-container theme theme--earth">
    <div class="container">
      <TheHeader />
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, provide, type Ref, ref, watch } from 'vue';
import TheHeader from '@/components/TheHeader';

import { liveQuery } from 'dexie';
import { useObservable } from '@vueuse/rxjs';
import { DatabaseCore, DatabaseApi } from './database';
import { EVENTS } from '@common/events';

export default defineComponent({
  name: 'App',
  components: {
    TheHeader
  },
  setup() {
    onMounted(() => {
      window.api.receive(EVENTS.exportDb, async (args?: string[]) => {
        const name = args && args.length > 0 ? args[0] : undefined;
        const buffer = await (
          await DatabaseApi.exportDatabase(name)
        ).arrayBuffer();
        window.api.send(EVENTS.exportDbComplete, {
          buffer,
          name: name ?? DatabaseApi.getCurrentDatabaseName()
        });
      });
      window.api.receive(
        EVENTS.importDb,
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
        return 'default';
      }) as any
    ) as Readonly<Ref<string>>;
    const currentDatabase = ref('');
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
    provide('currentDatabase', currentDatabase);
    // This is the value to watch
    provide('refetchDatabaseInfo', refetchDatabaseInfo);
  }
});
</script>

<style lang="scss">
#app .container {
  display: grid;
  gap: var(--layout-spacing-base);
}

#app .theme-container {
  background-color: var(--background);
  min-height: 100vh;
}
</style>
