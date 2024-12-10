import { createClient } from "@supabase/supabase-js";

let supabase: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = (config: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string }) => {
  if (!supabase) {
    supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  }
  return supabase;
};
