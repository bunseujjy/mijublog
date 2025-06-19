import { createClient } from "@supabase/supabase-js";

export default async function getAllUsers() {
  const config = useRuntimeConfig();
  const client = createClient(config.public.SUPABASE_URL,  config.public.SUPABASE_SERVICE_ROLE_KEY!);
  
  try {
    const { data: { users: userList }, error } = await client.auth.admin.listUsers();

    if (error) {
      throw new Error(`Error getting users: ${error.message}`);
    }

    return userList || [];
  } catch (err) {
    console.error("Error getting users:", err);
    throw err;  // re-throw the error to handle it properly where you call this function
  }
}