<script setup lang="ts">
import BlogNavigation from '~/components/Blog/BlogNavigation.vue';

const { user: currentUser } = useAuth();
const { 
  isLoading,
  error,
  fetchPosts,
  findPostAuthor,
  filterPostsByStatus
} = useBlogPosts();

onMounted(() => {
  fetchPosts();
});

const publishedPosts = computed(() => {
  if (!currentUser.value?.id) return [];
  return filterPostsByStatus(currentUser.value.id, 'posted');
});
</script>

<template>
  <div class="min-h-screen">
    <BlogHeader title="Your Stories" />
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Tabs default-value="published" class="w-full items-start">
        <BlogNavigation />
        <TabsContent value="published">
          <ul class="space-y-8 w-full">
            <template v-if="isLoading">
              <li class="text-center py-4">Loading...</li>
            </template>
            
            <template v-else-if="error">
              <li class="text-center text-red-500 py-4">{{ error.message }}</li>
            </template>
            
            <template v-else-if="publishedPosts.length">
              <li v-for="post in publishedPosts" :key="post.id"
                                class="border-b border-b-muted pb-5 transition-all duration-300 ease-in-out mt-5">
                                <BlogPost :post="post" :author="findPostAuthor(post.author_id)"/>
                            </li>
            </template>

            <template v-else>
              <li class="text-black dark:text-muted mt-5">
                <div v-if="currentUser">
                  You don't have any published posts yet!
                  <NuxtLink
                    to="/new_blog"
                    class="border-b border-orange-400 pb-2 hover:text-orange-400 transform duration-300 hover:border-opacity-60"
                  >
                    Create new post here!
                  </NuxtLink>
                </div>
                <div v-else>This user doesn't have any published posts yet!</div>
              </li>
            </template>
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>