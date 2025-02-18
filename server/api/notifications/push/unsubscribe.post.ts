import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const { endpoint } = await readBody(event)
  const client = await serverSupabaseClient(event)
  
  try {
    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const { error: deleteError } = await client
      .from('push_subscriptions')
      .delete()
      .match({ user_id: user.id, endpoint })

    if (deleteError) throw deleteError

    // Check if user has any remaining push subscriptions
    const { data: remainingSubscriptions, error: countError } = await client
      .from('push_subscriptions')
      .select('id')
      .match({ user_id: user.id })

    if (countError) throw countError

    // If no subscriptions remain, update preferences
    if (remainingSubscriptions.length === 0) {
      await client
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          push_enabled: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
    }

    return { success: true }
  } catch (error) {
    console.error('Push unsubscribe failed:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to unsubscribe from push notifications'
    })
  }
})