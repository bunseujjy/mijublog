import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#imports'

export function getSupabaseClient() {
  const config = useRuntimeConfig()
  
  return createClient(
    config.public.SUPABASE_URL,
    config.public.SUPABASE_ANON_KEY
  )
}