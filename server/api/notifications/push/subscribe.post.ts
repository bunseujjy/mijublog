import { serverSupabaseClient } from '#supabase/server'
import type { PushSubscription } from 'web-push'

export default defineEventHandler(async (event) => {
  const subscription: PushSubscription = await readBody(event)
  const client = await serverSupabaseClient(event)
  
  try {
    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const { data, error } = await client
      .from('push_subscriptions')
      .insert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      })
      .select()
      .single()

    if (error) throw error

    await client
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        push_enabled: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    return { success: true, subscription: data }
  } catch (error) {
    console.error('Push subscription failed:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to save push subscription'
    })
  }
})