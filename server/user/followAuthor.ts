import type { Database } from "~/supabase";

export async function followAuthor(currentUser_id: string, x: number, id: string, author_id: string) {
    try {
        const supabase = useSupabaseClient<Database>();

        // Check if the current user already follows the author
        const { data: existingUser } = await supabase
            .from('user_info')
            .select("*")
            .eq('author_id', author_id)
            .eq('follower_id', currentUser_id) // Check if the current user follows this particular author

        // Handle existing follow relationship
        if (!existingUser) {
            const { data: insertData, error: insertError } = await supabase.from('user_info').insert({
                follower_id: currentUser_id,
                author_id: author_id,
            });

            if (insertError) {
                throw new Error(insertError.message);
            }

            const { data: followData, error: followError } = await supabase.rpc("increment_follower", {
                x,
                row_id: id,
                user_id: author_id,
            });

            if (followError) {
                console.error('Error incrementing follower count:', followError);
                throw new Error(followError.message);
            }

            return { insertData, followData };
        }

        // If already following, just increment the follower count via rpc
        const { data: followData, error: followError } = await supabase.rpc("increment_follower", {
            x,
            row_id: id,
            user_id: author_id,
        });

        if (followError) {
            console.error('Error incrementing follower count:', followError);
            throw new Error(followError.message);
        }

        return { followData };
    } catch (error: any) {
        console.error(error.message);
        return null;
    }
}
