export async function getUserInfo(follower_id: string) {
    try {
        const client = useSupabaseClient()
        const {data, error} = await client.from("user_info").select("*").eq("follower_id", follower_id)
        if(error) {
            throw new Error(error.message)
        }
        return data || []
    } catch (error: any) {
        console.error(error.message)
    }
}