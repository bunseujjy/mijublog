import type { Database } from "~/supabase"

export async function showMoreOrLess(user_id: string, category_id: any, type: string){
    try {
        const client = useSupabaseClient<Database>()
        const {data, error} = await client.from("user_category_preferences").insert({
            user_id,
            category_id,
            interaction_type: type === 'more' ? 'more' : 'less',
        })
        if(error) {
            throw new Error(error.message)
        }
        return data || []
    } catch (error: any) {
        console.error(error.message)
    }
}