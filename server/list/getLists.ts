import type { Database } from "~/supabase"

export async function getLists(user_id: string) {
    try {
        const client = useSupabaseClient<Database>();
        const { data, error } = await client.from("user_lists").select("*").eq('user_id', user_id);
        if (error) {
            throw new Error(error.message); // Supabase error message for logging/debugging
        }
        return data || []; // Always return an array for consistent downstream usage
    } catch (error: any) {
        console.error("Error fetching list:", error.message); // Log for debugging

        // Optionally rethrow the error with context
        throw new Error("Failed to fetch list. Please try again later.");
    }
}
