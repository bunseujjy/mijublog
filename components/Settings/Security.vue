<template>
    <div>
      <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Security</h2>
      <form @submit.prevent="handlePasswordChange" class="space-y-4">
        <InputField
          id="current-password"
          v-model="currentPassword"
          type="password"
          label="Current Password"
          required
        />
        <InputField
          id="new-password"
          v-model="newPassword"
          type="password"
          label="New Password"
          required
        />
        <InputField
          id="confirm-password"
          v-model="confirmPassword"
          type="password"
          label="Confirm New Password"
          required
        />
        <Button type="submit" class="w-full">Change Password</Button>
      </form>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, inject } from 'vue'
  
  const client = useSupabaseClient()
  const showNotification = inject<any>('showNotification')
  
  const currentPassword = ref('')
  const newPassword = ref('')
  const confirmPassword = ref('')
  
  const handlePasswordChange = async () => {
    try {
      if (newPassword.value !== confirmPassword.value) {
        showNotification("New passwords don't match!", 'error')
        return
      }
  
      const { error } = await client.auth.updateUser({
        password: newPassword.value,
      })
  
      if (error) throw error
  
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
  
      showNotification('Password updated successfully')
    } catch (error) {
      console.error('Error updating password:', error)
      showNotification('Failed to update password', 'error')
    }
  }
  </script>