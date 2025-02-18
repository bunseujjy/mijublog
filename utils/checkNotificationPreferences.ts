import { createClient } from '@supabase/supabase-js'

export async function checkNotificationPreferences(
  userId: string
) {
  const config = useRuntimeConfig();
  const client = createClient(config.public.SUPABASE_URL, config.public.SUPABASE_ANON_KEY);
  const { data } = await client
    .from('notification_preferences')
    .select('email_enabled, push_enabled')
    .match({ user_id: userId })
    .single()

  return {
    emailEnabled: data?.email_enabled ?? true,
    pushEnabled: data?.push_enabled ?? true
  }
}