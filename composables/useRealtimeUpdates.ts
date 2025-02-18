import type { RealtimeChannel } from '@supabase/supabase-js';
import type { BlogData, Category } from '~/lib/type';

export const useRealtimeUpdates = () => {
  const supabase = useSupabaseClient();
  let channel: RealtimeChannel;

  const subscribeToChanges = (blog_db: BlogData[], category: Category, isCurrentUserFollowing: any[]) => {
      channel = supabase
      .channel("category_followed_by")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "category_followed_by" },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          if (eventType === "INSERT") {
            isCurrentUserFollowing = [
              ...isCurrentUserFollowing,
              newRecord,
            ];
          } else if (eventType === "DELETE") {
            isCurrentUserFollowing = isCurrentUserFollowing.filter(
              (item) => item.id !== oldRecord.id
            );
          }
        }
      )
      .subscribe();
    channel = supabase
      .channel("categories")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "categories" },
        (payload) => {
          const { new: newRecord } = payload;
          category.followers = newRecord.followers;
        }
      )
      .subscribe();

      // Listen for updates on the `blog_posts` table
      channel = supabase
        .channel("public:blog_posts")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "blog_posts",
          },
          async (payload) => {
            const { eventType, new: newRecord, old: oldRecord } = payload;

            if (eventType === "INSERT" || eventType === "UPDATE") {
              // Ensure newRecord is valid
              if (blog_db.find((data) => data.id === newRecord.id)) {
                blog_db = [...blog_db, ...(newRecord as BlogData[])]; // Merge changes
              }
            } else if (eventType === "DELETE") {
              // Handle deletion of the current blog
              if (blog_db.find((data) => data.id === oldRecord.id)) {
                blog_db = []; // Or handle as needed (e.g., navigate away)
              }
            }
          }
        )
        .subscribe();
  };

  const unsubscribe = () => {
    if (channel) {
      channel.unsubscribe();
    }
  };

  return {
    subscribeToChanges,
    unsubscribe
  };
};