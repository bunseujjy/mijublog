import type { Database } from "~/supabase";

export const likePost = async (x: number, id: string, userId: string) => {
  const client = useSupabaseClient<Database>();
  // Check if the user has already liked the post
  const { data: existingUser } = await client
    .from("like_by")
    .select("*")
    .eq("post_id", id)
    .eq("user_id", userId)  // Add condition to check user_id as well
    .single();

  // If user has already liked the post, decrement likes
  if (existingUser?.user_id === userId) {
    const { data, error } = await client.rpc("decrement", {
      x,
      row_id: id,
      user_id: userId,
    });

    if (error) {
      console.error(error.message);
    }
    return data;
  } else {
    // If user has not liked the post, increment likes
    const { data, error } = await client.rpc("increment", {
      x,
      row_id: id,
      user_id: userId,
    });

    if (error) {
      console.error("Error incrementing likes_count:", error.message);
    }
    return data;
  }
};
