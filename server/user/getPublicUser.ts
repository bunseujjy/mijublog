export async function getPublicUser() {
    try {
        const client = useSupabaseClient()
        const {data, error} = await client.from("profiles").select("*")
        if(error) {
            throw new Error(error.message)
        }
        return data || []
    } catch (error: any) {
        console.error(error.message)
    }
}