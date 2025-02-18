import webpush from 'web-push'

// Initialize web-push with VAPID keys
export const initializeWebPush = () => {
  webpush.setVapidDetails(
    'mailto:' + process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
  return webpush
}

interface WebPushSubscription extends PushSubscription {
  keys: {
    auth: string
    p256dh: string
  }
}

export const sendPushNotification = async (subscription: WebPushSubscription, payload: any) => {
  const push = initializeWebPush()
  return push.sendNotification(subscription, JSON.stringify(payload))
}