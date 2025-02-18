<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '../ui/toast'
import { useNotifications } from '~/composables/useNotifications'
import { registerServiceWorker } from '~/composables/useServiceWorker'

const { isLoading: isNotificationLoading, preferences, fetchNotificationPreferences, subscribePushNotification, unsubscribePushNotification } = useNotifications()
const { subscribe, unsubscribe, isSubscribing } = usePushNotification()
const { toast } = useToast()
const config = useRuntimeConfig()

const isLoading = computed(() => isNotificationLoading.value || isSubscribing.value)
const enabled = ref(preferences.value?.push_enabled || false)

const handleToggle = async (checked: boolean) => {
  console.log('[PushToggle] Toggle checked:', checked)
  
  if (checked) {
    try {
      // Register service worker first
      await registerServiceWorker()
      const subscription = await subscribe(config.public.VAPID_PUBLIC_KEY)
      
      if (!subscription) {
        console.error('[PushToggle] No subscription returned')
        throw new Error('No subscription created')
      }
      const result = await subscribePushNotification(subscription)
      
      if (!result.success) {
        throw new Error('Failed to save subscription')
      }
      enabled.value = true
      await fetchNotificationPreferences()
      toast({
        title: 'Success',
        description: 'Push notifications enabled',
      })
    } catch (error) {
      console.error('[PushToggle] Push subscription failed:', error)
      enabled.value = false
      toast({
        title: 'Error',
        description: 'Failed to enable push notifications',
        variant: 'destructive',
      })
    }
  } else {
    try {
      const endpoint = await unsubscribe()
      if (endpoint) {
        const result = await unsubscribePushNotification(endpoint)
        if (!result.success) {
          throw new Error('Failed to unsubscribe')
        }
        enabled.value = false
        await fetchNotificationPreferences()
        toast({
          title: 'Success',
          description: 'Push notifications disabled',
        })
      }
    } catch (error) {
      console.error('[PushToggle] Push unsubscription failed:', error)
      enabled.value = true
      toast({
        title: 'Error',
        description: 'Failed to disable push notifications',
        variant: 'destructive',
      })
    }
  }
}

onMounted(async () => {
  await fetchNotificationPreferences()
  enabled.value = preferences.value?.push_enabled || false
})
</script>

<template>
  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-lg font-medium">Push Notifications</h3>
      <p class="text-sm text-gray-500">Receive notifications in your browser</p>
    </div>
    <Switch
      :checked="enabled"
      :disabled="isLoading"
      @update:checked="handleToggle"
      :class="[
        isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      ]"
    />
  </div>
</template>