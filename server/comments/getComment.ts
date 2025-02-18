import type { Database } from "~/supabase";

export const getComment = async (post_id: string | null, list_id: string | null) => {
    const client = useSupabaseClient<Database>();

    let query = client.from("comments").select("*").order("created_at", { ascending: true });

    if (post_id) {
        query = query.eq("post_id", post_id);
    } else if (list_id) {
        query = query.eq("list_id", list_id);
    }

    const { data, error } = await query;

    if (error) {
        console.error(error.message);
    }

    return data;
};
