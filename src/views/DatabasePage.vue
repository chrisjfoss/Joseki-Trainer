<template>
  <div class="database-page">
    <p>Create a new database</p>
    <p>Delete an existing database</p>
    <p>Rename a database</p>

    <div class="databases">
      <p class="databases__header">Databases</p>
      <div class="databases__list">
        <ul>
          <li v-for="database in databases" :key="database">
            <span>{{ database }}</span>
            <button @click="deleteDatabase(database)">Delete</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { DatabaseApi } from "@/api";
import { defineComponent, onMounted, ref } from "vue";
import type { Ref } from "vue";

export default defineComponent({
  name: "DatabasePage",
  setup() {
    // Get databases
    const databases: Ref<string[]> = ref([]);

    const { deleteDatabase, getAvailableDatabases } = DatabaseApi;

    onMounted(async () => {
      databases.value = await getAvailableDatabases();
    });

    return {
      databases,
      deleteDatabase
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
