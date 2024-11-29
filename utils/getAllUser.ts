import { createClient } from "@supabase/supabase-js";

export default async function(){
  const supabase = createClient("https://nevebmcarvxkimtjpomw.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldmVibWNhcnZ4a2ltdGpwb213Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTMwMzU1MCwiZXhwIjoyMDQ2ODc5NTUwfQ.Q6SZ-JL27rsxwBZ5XqRLavhoy2wA4N4IM5V3Xrz1VxE", {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
    const { data: { users: userList }, error } = await supabase.auth.admin.listUsers()
  
    if (error) {
      console.error("Error getting session:", error);
    } else {
      return userList;
    }
}