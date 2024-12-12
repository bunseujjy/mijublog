import type { Database } from "~/supabase"

export async function likeReplies(x: number, id: string, user_id: string) {
    const client = useSupabaseClient<Database>()
    try {
        const existingReplies = await client.from("like_by_replies").select("*").eq("replies_id", id).eq("user_id", user_id).single()

        if(existingReplies.data?.user_id) {
            const {data, error} = await client.rpc("decrement_replies_like", {x, row_id: id, user_id: user_id})
            if(error) {
                throw new Error(error.message)
            }
            return data
        } else {
            const {data, error} = await client.rpc("increment_replies_like", {x, row_id: id, user_id: user_id})
            if(error) {
                throw new Error(error.message)
            }
            return data
        }
    } catch (error: any) {
        console.error(error.message)
    }
}