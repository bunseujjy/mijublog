export async function deleteComment(commend_id: string | null, replies_id: string | null) {
    try {
        const client = useSupabaseClient()
        if(replies_id !== null) {
            const {data, error} = await client.from("replies").delete().eq("id", replies_id)
        if(error) {
            throw new Error(error.message)
        }
        return data
        }
        const {data, error} = await client.from("comments").delete().eq("id", commend_id as string)
        if(error) {
            throw new Error(error.message)
        }
        return data
    } catch (error) {
        return error
    }
}