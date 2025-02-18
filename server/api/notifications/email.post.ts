import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const { enabled } = await readBody(event)
  const client = await serverSupabaseClient(event)
  
  try {
    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const { error } = await client
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        email_enabled: enabled,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) throw error

    return { success: true, email_enabled: enabled }
  } catch (error) {
    console.error('Email preference update failed:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update email preferences'
    })
  }
})