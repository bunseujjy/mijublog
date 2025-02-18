export const getSavedPostById = async (post_id: string, list_id: string) => {
    const client = useSupabaseClient()
    const {data, error} = await client.from("saved_posts").select("*").eq('post_id', post_id).eq('list_id', list_id)
    if(error) {
    console.error(error.message)
    }
    if (data) {
    // Make sure to push the posts to the blog_db array
    return data || []
    }
}