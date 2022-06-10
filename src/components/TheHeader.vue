<script lang="ts">
import { DatabaseApi } from "@/api";
import { defineComponent, inject, Ref, ref, watch } from "vue";

export default defineComponent({
  name: "TheHeader",
  setup() {
    const currentDatabase = inject("currentDatabase") as Ref<string>;
    const refetchDatabaseInfo = inject("refetchDatabaseInfo") as Ref<string>;

    const databases = ref([] as string[]);
    const updateDatabaseList = async () => {
      databases.value = await DatabaseApi.getAvailableDatabases();
    };

    watch(
      refetchDatabaseInfo,
      () => {
        if (refetchDatabaseInfo.value) {
          updateDatabaseList();
        }
      },
      {
        immediate: true
      }
    );
    return {
      currentDatabase,
      databases
    };
  }
});
</script>
<template>
  <div class="header">
    <div class="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/train">Train</router-link>
      <router-link to="/databases">Databases</router-link>
      <router-link to="/statistics">Statistics</router-link>
    </div>
    <div class="nav nav--end">
      <label for="database-select">Database:</label>
      <select id="database-select" v-model="currentDatabase">
        <option v-for="db in databases" :key="db" :value="db">{{ db }}</option>
      </select>
    </div>
  </div>
</template>
<style scoped lang="scss">
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--primary);
}
.header h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}
.header .nav {
  display: flex;
  align-items: center;
  color: var(--text);
  & a {
    margin-left: 1rem;
    text-decoration: none;
    color: var(--text);
  }
  & label {
    margin: 0 0.5rem;
  }
}
</style>
