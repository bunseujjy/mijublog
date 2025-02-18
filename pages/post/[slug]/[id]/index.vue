<script setup lang="ts">
  import type { BlogData } from '~/lib/type'
  import { useRoute } from 'vue-router'
  import type { User } from '@supabase/supabase-js';

  const client = useSupabaseClient()
  const blog_db = ref<BlogData | null>(null) // Allow for null as a valid state
  const route = useRoute()
  const post_id = computed(() => route.params.id);
  const { user: currentUser } =useAuth()
  const users = ref<User[]>([])
  const blogLoading = ref(false)
  const isError = ref(false);
  const getBlogData = async () => {
    try {
      const { data, error } = await client.from("blog_posts").select("*").eq("id", post_id.value).eq("visibility", "public");
      if (error) throw error;
      blog_db.value = data?.length > 0 ? data[0] : null;
    } catch (error) {
      console.error("Error fetching blog post:", error);
      isError.value = true;
    }
  };


  const MIN_LOADING_TIME = 300; // milliseconds
  onMounted(async () => {
    try {
      blogLoading.value = true;
      const startTime = Date.now();
      await getBlogData();
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < MIN_LOADING_TIME) {
        await new Promise((resolve) => setTimeout(resolve, MIN_LOADING_TIME - elapsedTime));
      }
    } catch (error) {
      console.error("Failed to fetch data");
    } finally {
      blogLoading.value = false;
    }
    try {
      const data = await getAllUser(); // Assuming this returns a Promise<User[]> or User
      if (data) {
        users.value = data || [];
      } else {
        isError.value = true; // Set error state if data is null or undefined
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      isError.value = true;
    } finally {
    }
    // Listen for updates on the `blog_posts` table
    client
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
            if (newRecord && newRecord.id === blog_db.value?.id) {
              blog_db.value = { ...blog_db.value, ...newRecord as BlogData }; // Merge changes
            }
          } else if (eventType === "DELETE") {
            // Handle deletion of the current blog
            if (oldRecord && oldRecord.id === blog_db.value?.id) {
              blog_db.value = { ...blog_db.value, ...oldRecord as BlogData }; // Or handle as needed (e.g., navigate away)
            }
          }
        }
      )
      .subscribe();
  })
  onUnmounted(() => {
    client.channel("blog_posts").unsubscribe();
  });
</script>

<template>
  <div class="max-w-[780px] mx-auto px-4 md:px-0">
    <div v-if="blogLoading" class="w-full">
      <BlogPostLoading />
    </div>
    <div v-else-if="!blog_db">
      <p>No blog post found.</p>
    </div>
    <div v-else>
      <SinglePost :blog_db="blog_db" :currentUser="currentUser" :users="users" />
    </div>

  </div>
</template>
