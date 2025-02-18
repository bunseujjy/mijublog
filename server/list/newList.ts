import type { Database } from "~/supabase"

export async function newUserList(user_id: string, name: string, desc: string, status: string, slug: string) {
    try {
        const client = useSupabaseClient<Database>();
        const { data, error } = await client.from("user_lists").insert({
            user_id: user_id,
            name: name,
            description: desc,
            status: status,
            slug
        });
        if (error) {
            throw new Error(error.message); // Supabase error message for logging/debugging
        }
        return data; // Return the inserted data for further use
    } catch (error: any) {
        console.error("Error creating new list:", error.message); // Log for debugging

        // Optionally rethrow the error with context
        throw new Error("Failed to create a new list. Please try again later.");
    }
}
