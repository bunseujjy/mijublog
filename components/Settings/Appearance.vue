<template>
  <div>
    <label for="theme" class="block text-sm font-medium text-gray-700 dark:text-white">Theme</label>
    <select
      id="theme"
      v-model="theme"
      @change="updateColorPreference"
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useColorMode } from '#imports'

const color = useColorMode()
const theme = ref(color.preference)

const updateColorPreference = () => {
  color.preference = theme.value
}
</script>