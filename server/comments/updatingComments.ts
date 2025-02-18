import type { Database } from "~/supabase";

export async function updatingComments(
    comment_id: string,
    content: string,
    user_id: string,
    post_id: string | null,
    list_id: string | null
) {
    const client = useSupabaseClient<Database>();

    // Ensure that at least one identifier (post_id or list_id) is provided
    if (!post_id && !list_id) {
        throw new Error("Either post_id or list_id must be provided.");
    }

    let query = client
        .from("comments")
        .update({ content })
        .eq("id", comment_id)
        .eq("user_id", user_id);

    // Dynamically add the filter for post_id or list_id
    if (post_id) {
        query = query.eq("post_id", post_id);
    } else if (list_id) {
        query = query.eq("list_id", list_id);
    }

    const { data, error } = await query.select("*");

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function updatingReply(
    content: string,
    reply_id: string,
    user_id: string,
    post_id: string | null,
    list_id: string | null
) {
    const client = useSupabaseClient<Database>();

    // Ensure that at least one identifier (post_id or list_id) is provided
    if (!post_id && !list_id) {
        throw new Error("Either post_id or list_id must be provided.");
    }

    // Fetch the existing reply to validate ownership
    const { data: existingReply, error: fetchError } = await client
        .from("replies")
        .select("*")
        .eq("id", reply_id)
        .eq("user_id", user_id)
        .single();

    if (fetchError) {
        throw new Error(fetchError.message);
    }

    if (existingReply) {
        let query = client
            .from("replies")
            .update({ content })
            .eq("id", reply_id)
            .eq("user_id", user_id);

        // Dynamically add the filter for post_id or list_id
        if (post_id) {
            query = query.eq("post_id", post_id);
        } else if (list_id) {
            query = query.eq("list_id", list_id);
        }

        const { data, error } = await query.select("*");

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } else {
        throw new Error("Reply not found or user is not authorized.");
    }
}
