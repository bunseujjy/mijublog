import type { Database } from "~/supabase";

export async function followUser(currentUser_id: string, user_id: string) {
    try {
        const supabase = useSupabaseClient<Database>();

        // Check if the current user already follows the author
        const { data: existingUser } = await supabase
            .from('user_info')
            .select("*")
            .eq('user_id', user_id)
            .eq('follower_id', currentUser_id) // Check if the current user follows this particular author

        // Handle existing follow relationship
        if (!existingUser) {
            const { data: insertData, error: insertError } = await supabase.from('user_info').insert({
                follower_id: currentUser_id,
                author_id: user_id,
            });

            if (insertError) {
                throw new Error(insertError.message);
            }

            const {error} = await supabase.from("profiles").update({
                following_length: + 1
            }).eq("user_id", currentUser_id).select("*")

            if(error) {
                throw new Error(error.message);
            }

            return { insertData };
        }

        const {error} = await supabase.from("profiles").update({
                following_length: + 1
            }).eq("user_id", currentUser_id).select("*")
            
            if(error) {
                throw new Error(error.message);
            }

    } catch (error: any) {
        console.error(error.message);
        return null;
    }
}
