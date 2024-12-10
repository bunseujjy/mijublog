import { createClient } from "@supabase/supabase-js";

export default async function(){
  const config = useRuntimeConfig()
  const client = createClient(config.public.SUPABASE_URL, config.public.SUPABASE_ANON_KEY)
  const { data: { users: userList }, error } = await client.auth.admin.listUsers()

  if (error) {
    console.error("Error getting session:", error);
  } else {
    return userList;
  }
}