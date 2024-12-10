export const getCurrentUserCmt = async (user_id: string) => {
    const client = useSupabaseClient();

    // Use .in() for filtering multiple post IDs
    const { data, error } = await client
        .from("comments")
        .select("*")
        .eq("user_id", user_id) // Correct usage
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching comments:", error.message);
        return null;
    }

    return data;
};

export const getRepliesResponse = async (user_id: string) => {
    const client = useSupabaseClient();

    // Use .in() for filtering multiple post IDs
    const { data, error } = await client
        .from("replies")
        .select("*")
        .eq("user_id", user_id) // Correct usage
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching comments:", error.message);
        return null;
    }

    return data;
}