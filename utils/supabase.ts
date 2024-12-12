import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/supabase";

const options = {
  auth: {
    localStorage: true,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
};

const supabaseUrl = 'https://nevebmcarvxkimtjpomw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldmVibWNhcnZ4a2ltdGpwb213Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTMwMzU1MCwiZXhwIjoyMDQ2ODc5NTUwfQ.Q6SZ-JL27rsxwBZ5XqRLavhoy2wA4N4IM5V3Xrz1VxE'

const client = createClient<Database>(supabaseUrl, supabaseKey, options);

const supabase = () => client;

export default supabase;