<script setup lang="ts">
import type { User } from '@supabase/supabase-js';
import type { BlogData, Lists, SavedPosts } from '~/lib/type';

defineProps<{
    blog_db: BlogData[];
    user: User | null;
    findPostAuthor: (author_id: string) => void | User;
    savedArticles: Lists[];
    savedPost: SavedPosts[]
}>()
</script>

<template>
    
    <ul class="space-y-8">
          <li v-for="article in savedArticles" :key="article.id"
            class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div class="flex items-center justify-between p-6">
              <div class="w-full">
                <div class="flex items-center mb-4">
                  <img :src="user?.user_metadata.profile_url" alt="Author avatar"
                    class="h-10 w-10 rounded-full mr-4 object-cover" />
                  <p class="text-sm font-medium text-gray-900 dark:text-muted">
                    {{ user?.user_metadata.username }}
                  </p>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-muted mb-2">
                  {{ article.name }}
                </h3>
                <p class="text-gray-600 dark:text-muted mb-4">
                  {{ article.description }}
                </p>
              </div>
              <div class="w-[294px] flex">
                <div class="relative flex items-center justify-end">
                  <div v-for="(post, index) in blog_db
                    .filter((p) =>
                      savedPost.find((sp) => sp.post_id === p.id)
                    )
                    .slice(0, 4)" :key="post?.id" :style="{
                        zIndex: blog_db.length - 1 - index,
                        position: 'relative',
                        marginLeft: `${index * -20}px`,
                      }">
                    <NuxtLink :to="`post/@${findPostAuthor(post.author_id)?.user_metadata.username}/${post.id}`">
                      <NuxtImg :src="post.featured_image_url" alt="post_img"
                        class="w-[200px] h-[150px] object-cover rounded" />
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
</template>