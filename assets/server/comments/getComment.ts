export const getComment = async (post_id: string) => {
    const client = useSupabaseClient()
    const {data, error} = await client.from("comments").select("*").eq("post_id", post_id).order('created_at', { ascending: true });
    if(error) {
        console.error(error.message)
    }
    return data
}