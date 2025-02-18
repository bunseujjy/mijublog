import { urlBase64ToUint8Array } from '~/utils/pushNotification'

export function usePushNotification() {
  const isSubscribing = ref(false)

  const subscribe = async (vapidKey: string) => {
    console.log('[Push] Starting subscription process')
    isSubscribing.value = true
    
    try {
      if (!('serviceWorker' in navigator)) {
        console.error('[Push] Service Worker not supported')
        throw new Error('Service Worker not supported')
      }

      // Check if service worker is registered
      const registrations = await navigator.serviceWorker.getRegistrations()
      
      if (registrations.length === 0) {
        console.error('[Push] No service worker registered')
        throw new Error('No service worker registered')
      }
      const registration = await navigator.serviceWorker.ready
      // Check permission status
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        throw new Error('Notification permission denied')
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidKey)
      const existingSubscription = await registration.pushManager.getSubscription()
      if (existingSubscription) {
        console.log('[Push] Found existing subscription, unsubscribing')
        await existingSubscription.unsubscribe()
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      })
      
      return subscription
    } catch (error) {
      console.error('[Push] Subscription creation failed:', error)
      throw error
    } finally {
      isSubscribing.value = false
    }
  }

  const unsubscribe = async () => {
    console.log('[Push] Starting unsubscribe process')
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        console.log('[Push] Found subscription to unsubscribe:', subscription.endpoint)
        await subscription.unsubscribe()
        return subscription.endpoint
      }
      
      console.log('[Push] No subscription found to unsubscribe')
      return null
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error)
      throw error
    }
  }

  return {
    isSubscribing,
    subscribe,
    unsubscribe
  }
}