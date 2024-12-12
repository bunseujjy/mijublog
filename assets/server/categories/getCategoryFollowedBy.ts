import type { Database } from "~/supabase";

export async function getCategoryFollowedBy(category_id: string, user_id: string) {
    try {
        const supabase = useSupabaseClient<Database>()
        const {data, error} = await supabase.from("category_followed_by").select("*").eq("category_id", category_id).eq("user_id", user_id)

        if(error) {
            throw new Error(error.message)
        }
        return data || []
    } catch (error) {
        console.error(error)
    }
}