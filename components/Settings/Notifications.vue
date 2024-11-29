<template>
    <div>
      <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Notifications</h2>
      <div class="space-y-4">
        <SwitchField
          v-model="emailNotifications"
          label="Email Notifications"
          description="Receive notifications via email"
        />
        <SwitchField
          v-model="pushNotifications"
          label="Push Notifications"
          description="Receive push notifications on your devices"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  const emailNotifications = ref(true)
  const pushNotifications = ref(false)
  </script>