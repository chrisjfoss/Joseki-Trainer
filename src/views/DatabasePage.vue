<template>
  <div class="database-page">
    <p>Create a new database</p>
    <div class="database__create">
      <input
        v-model="newDatabaseName"
        type="text"
        placeholder="Database name"
      />
      <div>
        <p>Player:</p>
        <select v-model="newDatabasePlayer">
          <option value="0">All</option>
          <option value="-1">Black</option>
          <option value="1">White</option>
        </select>
      </div>

      <button @click="createDatabase">Create</button>
    </div>
    <p>Delete an existing database</p>
    <p>Rename a database</p>

    <div class="databases">
      <p class="databases__header">Databases</p>
      <div class="databases__list">
        <ul>
          <li v-for="database in databases" :key="database">
            <span>{{ database }}</span>
            <button @click="deleteDb(database)">Delete</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { DatabaseApi } from "@/api";
import { defineComponent, inject, onMounted, ref, watch } from "vue";
import type { Ref } from "vue";

export default defineComponent({
  name: "DatabasePage",
  setup() {
    // Get databases
    const databases: Ref<string[]> = ref([]);

    const { deleteDatabase, getAvailableDatabases } = DatabaseApi;

    const refetchDatabaseInfo = inject("refetchDatabaseInfo") as Ref<boolean>;
    const deleteDb = async (name: string) => {
      refetchDatabaseInfo.value = false;
      await deleteDatabase(name);
      refetchDatabaseInfo.value = true;
    };

    onMounted(async () => {
      databases.value = await getAvailableDatabases();
    });
    watch(refetchDatabaseInfo, async () => {
      if (refetchDatabaseInfo.value) {
        databases.value = await getAvailableDatabases();
      }
    });

    const newDatabaseName = ref("");
    const newDatabasePlayer = ref(0) as Ref<0 | 1 | -1>;

    const createDatabase = async () => {
      const name = newDatabaseName.value;
      if (name) {
        refetchDatabaseInfo.value = false;
        await DatabaseApi.createDatabase(name, newDatabasePlayer.value);
        refetchDatabaseInfo.value = true;
      }
    };

    return {
      databases,
      deleteDb,
      createDatabase,
      newDatabaseName,
      newDatabasePlayer
    };
  }
});
</script>
<style scoped lang="scss">
.database-page {
  margin: 0 1rem;
  display: grid;
  gap: 1rem;
}
.databases {
  &__list {
    background: red;
  }
}
p {
  color: white;
}
</style>
