import type { Database } from "~/supabase"

export async function removePostFromList(user_id: string, post_id: string, list_id: string){
    try {
        const client = useSupabaseClient<Database>();
        const { data, error } = await client.from("saved_posts").delete().eq('user_id', user_id).eq('post_id', post_id).eq('list_id', list_id);
        if (error) {
            throw new Error(error.message); // Supabase error message for logging/debugging
        }
        return data || []; // Always return an array for consistent downstream usage
    } catch (error: any) {
        console.error("Error removing post from list:", error.message); // Log for debugging

        // Optionally rethrow the error with context
        throw new Error("Failed to remove post from list. Please try again later.");
    }
}
