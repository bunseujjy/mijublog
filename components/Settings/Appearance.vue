<template>
    <div>
      <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Appearance</h2>
      <div>
        <SelectField
          id="theme"
          v-model="theme"
          label="Theme"
          :options="themeOptions"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  const theme = ref('light')
  const themeOptions = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ]
  </script>