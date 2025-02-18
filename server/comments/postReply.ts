import type { Database } from "~/supabase"

export const postReply = async (post_id: string | null, list_id: string | null, comment_id: string, user_id: string, content: string, parent_reply_id: string | null, type: string) => {
    const client = useSupabaseClient<Database>()
    const {data, error} = await client.from("replies").insert([{
        post_id,
        list_id,
        comment_id,
        user_id,
        content,
        parent_reply_id,
        type
    }]).select("*")
    if(error) {
        throw new Error(error.message)
    }
    return data
}