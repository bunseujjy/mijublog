<template>
  <form @submit.prevent="handlePasswordChange" class="space-y-4">
    <div>
      <label for="current-password" class="block text-sm font-medium text-gray-700 dark:text-white">Current Password</label>
      <input
        id="current-password"
        v-model="currentPassword"
        type="password"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2 outline-none transform duration-300"
      >
    </div>
    <div>
      <label for="new-password" class="block text-sm font-medium text-gray-700 dark:text-white">New Password</label>
      <input
        id="new-password"
        v-model="newPassword"
        type="password"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2 outline-none transform duration-300"
      >
    </div>
    <div>
      <label for="confirm-password" class="block text-sm font-medium text-gray-700 dark:text-white">Confirm New Password</label>
      <input
        id="confirm-password"
        v-model="confirmPassword"
        type="password"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2 outline-none transform duration-300"
      >
    </div>
    <button type="submit" class="w-full bg-blue-500 dark:bg-black dark:border dark:border-muted dark:hover:bg-opacity-60 text-white py-2 px-4 rounded-md hover:bg-blue-600 dark:hover:bg-transparent focus:outline-none focus:ring-opacity-50 transform duration-300">
      Change Password
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSupabaseClient } from '#imports'
import { useToast } from '~/components/ui/toast'

const client = useSupabaseClient()
const { toast } = useToast()
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const handlePasswordChange = async () => {
  try {
    if (newPassword.value !== confirmPassword.value) {
      toast({ description: "New passwords don't match!", variant: "destructive" })
      return
    }

    const { error } = await client.auth.updateUser({
      password: newPassword.value
    })

    if (error) throw error

    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    toast({ description: 'Password updated successfully' })
  } catch (error) {
    console.error('Error updating password:', error)
    toast({ description: 'Failed to update password', variant: 'destructive' })
  }
}
</script>