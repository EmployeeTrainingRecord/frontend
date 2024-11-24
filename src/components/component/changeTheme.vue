<script setup>
import { ref } from "vue";

// Theme binding
const selectedTheme = ref("dark");
const changeTheme = () => {
  document.documentElement.setAttribute("data-theme", selectedTheme.value);
};
</script>

<template>
  <div>
    <!-- Theme Selector -->
    <div class="mb-4">
      <select
        class="px-3 py-2 rounded-xl border border-black"
        v-model="selectedTheme"
        @change="changeTheme"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="cupcake">Cupcake</option>
        <option value="bumblebee">Bumblebee</option>
      </select>
    </div>

    <!-- Table Section -->
  </div>
</template>

<style>
/* Add any global styles if needed */
</style>
