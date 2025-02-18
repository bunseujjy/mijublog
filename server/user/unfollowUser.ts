import type { Database } from "~/supabase";

export async function unfollowUser(user_id: string){
    try {
        const supabase = useSupabaseClient<Database>();
            const {error: profileError} = await supabase.from("profiles").update({
                following_length: - 1
            }).eq("user_id", user_id).select("*")
            
            if(profileError) {
                throw new Error(profileError.message);
            }
        } catch (error: any) {
        console.error(error.message)
    }
}