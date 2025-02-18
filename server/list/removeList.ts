import type { Database } from "~/supabase";

export async function removeList(user_id: string, list_id: string) {
  try {
    const supabase = useSupabaseClient<Database>();
    await supabase
      .from("saved_posts")
      .delete()
      .eq("user_id", user_id)
      .eq("list_id", list_id)
      .select('*');
    const { data, error } = await supabase
      .from("user_lists")
      .delete()
      .eq("user_id", user_id)
      .eq("id", list_id)
      .select("*");

      if (error) {
        console.error(error.message);
      }
      return data || [];
  } catch (error: any) {
    throw new Error(error);
  }
}
