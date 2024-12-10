export async function getUserInfo() {
    try {
        const client = useSupabaseClient()
        const {data, error} = await client.from("user_info").select("*")
        if(error) {
            throw new Error(error.message)
        }
        return data || []
    } catch (error: any) {
        console.error(error.message)
    }
}