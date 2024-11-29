import type { Database } from "~/supabase"

export const postComment = async (user_id: string, content: string, post_id: string) => {
    const client = useSupabaseClient<Database>()
    const {data, error} = await client.from("comments").insert([{
        user_id,
        content,
        post_id,
    }]).select("*")
    if(error) {
        console.log(error.message)
    }
    return data
}