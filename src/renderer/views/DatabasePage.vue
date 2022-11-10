<template>
  <div class="database-page">
    <section class="databases">
      <h2 class="databases__header">Databases (Edit & Delete)</h2>
      <ul class="databases__list">
        <li
          v-for="database in databases"
          :key="database"
          class="databases__item item"
        >
          <span class="item__name">{{ database }}</span>
          <button class="item__button" @click="exportDb(database)">
            Export
          </button>
          <button class="item__button" @click="deleteDb(database)">
            Delete
          </button>
        </li>
      </ul>
    </section>
    <section class="database__create">
      <p>Create a new database</p>
      <input
        v-model="newDatabaseName"
        type="text"
        placeholder="Database name"
      />
      <p>Player:</p>
      <select v-model="newDatabasePlayer">
        <option value="0">All</option>
        <option value="-1">Black</option>
        <option value="1">White</option>
      </select>

      <button @click="createDatabase">Create</button>
    </section>
  </div>
</template>
<script lang="ts">
import { DatabaseApi } from "@/database";
import { defineComponent, inject, onMounted, ref, watch } from "vue";
import type { Ref } from "vue";
import { EVENTS } from "@common/events";

const apiWindow = window as typeof window & {
  api: {
    send: Function;
    receive: Function;
  };
};

export default defineComponent({
  name: "DatabasePage",
  setup() {
    // Get databases
    const databases: Ref<string[]> = ref([]);

    const { deleteDatabase, getAvailableDatabases } = DatabaseApi;

    const exportDb = (name: string) => {
      apiWindow.api.send(EVENTS.exportDbStart, name);
    };

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
    const newDatabasePlayer = ref("0") as Ref<"0" | "1" | "-1">;

    const createDatabase = async () => {
      const name = newDatabaseName.value;
      if (name) {
        refetchDatabaseInfo.value = false;
        await DatabaseApi.createDatabase(
          name,
          Number.parseInt(newDatabasePlayer.value ?? "0") as 0 | 1 | -1
        );
        await DatabaseApi.switchToDatabase(name);
        refetchDatabaseInfo.value = true;
      }
    };

    return {
      databases,
      deleteDb,
      exportDb,
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
.database {
  &__create {
    background-color: var(--primary);
    padding: 1rem;
    display: flex;
    column-gap: 1rem;
    align-items: center;
  }
}
.databases {
  padding: 1rem;
  background-color: var(--primary);
  color: var(--text);
  &__header {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }
  &__list {
    padding: 0;
    margin: 0;
  }
  &__item {
    display: grid;
    grid-template-columns: 1fr repeat(3, min-content);
    gap: 1rem;
    list-style: none;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--background);
    border-bottom: 0;

    &:last-child {
      border-bottom: 1px solid var(--background);
    }
    padding: 0.75rem;
  }
}
p {
  color: var(--text);
}
</style>
