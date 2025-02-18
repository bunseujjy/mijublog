export async function deletingSavedPost(post_id: string, user_id: string, list_id: string) {
    try {
        const supabase = useSupabaseClient()
        const { data, error } = await supabase.from('saved_posts').delete().eq('post_id', post_id).eq('user_id', user_id).eq('list_id', list_id).select('*')
        if(error) {
            console.error(error.message)
        }
        return data || []
    } catch (error: any) {
        throw new Error(error.message)
    }
}