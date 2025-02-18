<script setup lang="ts">
import { useToast } from '../ui/toast'
import { Switch } from '../ui/switch'
import { useNotifications } from '~/composables/useNotifications'

const { isLoading, updateEmailPreference, preferences, fetchNotificationPreferences } = useNotifications()
const { toast } = useToast()

const handleToggle = async (enabled: boolean) => {
  const { success } = await updateEmailPreference(enabled)
  
  if (success) {
    toast({
      title: 'Success',
      description: `Email notifications ${enabled ? 'enabled' : 'disabled'}`,
    })
  } else {
    toast({
      title: 'Error',
      description: 'Failed to update email preferences',
      variant: 'destructive',
    })
  }
}

onMounted(async () => {
  await fetchNotificationPreferences()
})
</script>

<template>
  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-lg font-medium">Email Notifications</h3>
      <p class="text-sm text-gray-500">Receive notifications via email</p>
    </div>
    <Switch
      :checked="preferences.email_enabled"
      :disabled="isLoading"
      @update:checked="handleToggle"
      :class="[
        isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      ]"
    />
  </div>
</template>