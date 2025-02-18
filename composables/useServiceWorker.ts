export async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported')
    }
  
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('[ServiceWorker] Registration successful:', registration)
      return registration
    } catch (error) {
      console.error('[ServiceWorker] Registration failed:', error)
      throw error
    }
  }