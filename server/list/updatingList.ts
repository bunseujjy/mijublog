import type { Database } from "~/supabase"

export async function updatingList(name: string | null, description: string | null, status: string | null, user_id: string, list_id: string) {
    try {
        const supabase = useSupabaseClient<Database>()
        const { data, error } = await supabase.from('user_lists').update({
            name: name ?? '',
            slug: name?.toLocaleLowerCase().replace(/\s+/g, "-") ?? '',
            description: description ?? '',
            status
        }).eq('user_id', user_id).eq('id', list_id).select('*')
        if(error) {
            console.error(error.message)
        }
        return data
    } catch (error: any) {
        throw new Error(error)        
    }
}