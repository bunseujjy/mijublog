import type { Database } from "~/supabase";

export async function unfollowAuthor(x: number, id: string, user_id: string){
    try {
        const supabase = useSupabaseClient<Database>();
            const {data, error} = await supabase.rpc("decrement_follower", {
                x,
                row_id: id,
                user_id: user_id,
            });
            if(error) {
                throw new Error(error.message)
            }
            return data || []
        } catch (error: any) {
        console.error(error.message)
    }
}