import  type { Database } from "~/supabase"

export async function likeComment(x: number, id: string, userId: string) {
    const client = useSupabaseClient<Database>()
    try {
        const existingComment = await client.from("like_by_comments").select("*").eq("comment_id", id).eq("user_id", userId).single()
        if(existingComment.data?.user_id === userId) {
            const {data, error} = await client.rpc('decrement_comment_like', {x, row_id: id, user_id: userId})
        if(error) {
            throw new Error(error.message)
        }
        return data
        } else {
        const {data, error} = await client.rpc('increment_comment_like', {x, row_id: id, user_id: userId})
        if(error) {
            throw new Error(error.message)
        }
        return data
        }
    } catch (error: any) {
        throw new Error(error)
    }
}