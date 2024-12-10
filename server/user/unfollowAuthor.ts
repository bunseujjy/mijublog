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
            const {error: profileError} = await supabase.from("profiles").update({
                following_length: - 1
            }).eq("id", user_id).select("*")
            
            if(profileError) {
                throw new Error(profileError.message);
            }
            return data || []
        } catch (error: any) {
        console.error(error.message)
    }
}