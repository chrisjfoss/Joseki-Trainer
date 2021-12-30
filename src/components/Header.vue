<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Header"
});
</script>
<template>
  <div class="header">
    <div class="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/train">Train</router-link>
      <router-link to="/statistics">Statistics</router-link>
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
}
.header .nav a {
  margin-left: 1rem;
  text-decoration: none;
  color: var(--text);
}
</style>
