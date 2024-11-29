import type { Database } from "~/supabase"

export async function savePost(user_id: string, post_id: string, list_id: string) {
    try {
        const client = useSupabaseClient<Database>()
        const {data, error} = await client.from("saved_posts").insert({
            user_id,
            post_id,
            list_id
        }).select("*")
        if(error) {
            throw new Error(error.message)
        }
        return data
    } catch (error) {
        console.error(error)
    }
}