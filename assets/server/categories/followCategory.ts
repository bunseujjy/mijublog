import type { Database } from "~/supabase";
import { getCategoryFollowedBy } from "./getCategoryFollowedBy";

export async function followCategory(x: number, id: string, user_id: string) {
  try {
    const supabase = useSupabaseClient<Database>();
    const alreadyFollowing = await getCategoryFollowedBy(id, user_id);
    if (alreadyFollowing?.find((data) => data.user_id === user_id)) {
      const { data, error } = await supabase.rpc(
        "decrement_category_follower",
        {
          x,
          row_id: id,
          user_id: user_id,
        }
      );

      if (error) {
        throw new Error(error.message);
      }
      return data;
    } else {
      const { data, error } = await supabase.rpc(
        "increment_category_follower",
        {
          x,
          row_id: id,
          user_id: user_id,
        }
      );

      if (error) {
        throw new Error(error.message);
      }
      return data;
    }
  } catch (error: any) {
    console.error(error.message);
  }
}
