import type { Database } from "~/supabase"

export async function updatingComments(comment_id: string, content: string, reply_id: string, user_id: string, post_id: string) {
    const client = useSupabaseClient<Database>()
    
    const existingReplies = await client.from("replies").select("*").eq("id", reply_id).eq("user_id", user_id).single()

    if(existingReplies) {
        const {data, error} = await client.from("replies").update({
            content
        }).eq("id", reply_id).eq("user_id", user_id).select("*")
        if(error) {
            throw new Error(error.message)
        }
        return data
    }
    const {data, error} = await client.from("comments").update({
        content
    }).eq("id", comment_id).eq("post_id", post_id).select("*")
    if(error) {
        throw new Error(error.message)
    }
    return data
}