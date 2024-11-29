<script setup lang="ts">
import type { BlogData } from '~/lib/type'
import { useRoute } from 'vue-router'
import type { Database } from '~/supabase'
import type { User } from '@supabase/supabase-js';

const client = useSupabaseClient()
const blog_db = ref<BlogData | null>(null) // Allow for null as a valid state
const route = useRoute()
const post_id = computed(() => route.params.id);
const currentUser = ref()
const users = ref<User[]>([])
const isLoading = ref(true);       // Track loading state
const isError = ref(false);        // Track error state
let authorDetails = ref<any>(null);
const getBlogData = async () => {
    const { data, error } = await client.from("blog_posts").select("*").eq("id", post_id.value)
    if (error) {
        console.error(error.message)
    }
    // Ensure data is not empty before assigning to blog_db
    if (data && data.length > 0) {
        blog_db.value = data[0] // Get the first blog post since Supabase returns an array
    } else {
        blog_db.value = null // In case no data is found, you can handle the empty state here
    }
}

watchEffect(() => {
    // Only compute authorDetails if user.value is populated and blog_db is available
    if (users.value.length > 0 && blog_db.value) {
      authorDetails.value = users.value.find((u) => {
        return blog_db.value?.author_id === u.id;
      });
    }
  });
onMounted(async () => {
    getBlogData()
    await getCurrentUser(currentUser)
    try {
      const data = await getAllUser(); // Assuming this returns a Promise<User[]> or User

      if (data) {
        // If data is an array of User objects, spread it into the user array
        users.value = [...data];
      } else {
        isError.value = true; // Set error state if data is null or undefined
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      isError.value = true;
    } finally {
      isLoading.value = false;
    }
})
</script>

<template>
    <div class="max-w-[780px] mx-auto flex items-center justify-center px-4 md:px-0">
        <!-- Render SinglePost only if blog_db is not null -->
        <SinglePost v-if="blog_db" :blog_db="blog_db" :currentUser="currentUser" :authorDetails="authorDetails" :users="users"/>
        <p v-else>Loading...</p>
    </div>
</template>

