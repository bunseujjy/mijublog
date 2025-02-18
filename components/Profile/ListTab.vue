<script setup lang="ts">
  import type { User } from '@supabase/supabase-js';
  import { Lock, LockOpen } from 'lucide-vue-next';
  import type { BlogData, Lists, SavedPosts } from '~/lib/type';

  defineProps<{
    blog_db: BlogData[];
    user: User | null;
    findPostAuthor: (author_id: string) => void | User;
    savedArticles: Lists[];
    savedPost: SavedPosts[]
  }>()
  const route = useRoute()

  const linkToCopy = (article: Lists) => {
    return `${window.location.origin}${route.path}/${article.name?.toLowerCase().replace(/\s+/g, '-')}`;
  };
</script>

<template>
  <ul class="space-y-8">
    <li v-for="article in savedArticles" :key="article.id"
      class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <NuxtLink :to="`${route.fullPath}/${article.slug}`" class="flex items-center justify-between p-6">
        <div class="w-full h-full flex flex-col justify-between space-y-4">
          <div class="flex items-center">
            <NuxtImg format="webp" loading="lazy" :src="user?.user_metadata.profile_url" alt="Author avatar"
              class="h-10 w-10 rounded-full mr-4 object-cover" quality="80" />
            <p class="text-sm font-medium text-gray-900 dark:text-muted">
              {{ user?.user_metadata.username }}
            </p>
          </div>
          <div class="w-full">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-muted">
              {{ article.name }}
            </h3>
            <p class="text-gray-600 dark:text-muted">
              {{ article.description }}
            </p>
          </div>
          <div class="flex items-center justify-between mr-2">
            <p class="text-black dark:text-white">{{ savedPost.filter((data) => data.list_id === article.id).length }} blogs
              <span class="inline-block align-middle" v-if="savedArticles.some((data) => data.status !== 'public')">
                <Lock :size="14" />
              </span>
              <span v-else class="inline-block align-middle">
                <LockOpen :size="14" />
              </span>
            </p>
            <EditingList :article="article" :user="user" url="success=true" :linkToCopy="linkToCopy(article)"/>
          </div>
        </div>
        <div class="w-[294px] flex">
          <div class="relative flex items-center justify-end" v-if="savedPost.length > 0">
            <div v-for="post in blog_db
              .filter((p) =>
                savedPost.find((sp) => sp.post_id === p.id && sp.user_id === user?.id)
              ).slice(0, 4)" :key="post?.id" class="ml-1">
              <NuxtLink :to="`/post/@${findPostAuthor(post.author_id)?.user_metadata.username}/${post.id}`">
                <NuxtImg format="webp" loading="lazy" :src="post.featured_image_url" alt="post_img"
                  class="w-[200px] h-[150px] object-cover rounded" />
              </NuxtLink>
            </div>
          </div>
          <div v-else class="relative flex items-center justify-end">
            <div v-for="(_, index) in Array.from({ length: 3 })" :key="index">
              <div class="w-[150px] h-[150px] bg-gray-600 object-cover rounded shadow-lg ml-1" />
            </div>
          </div>
        </div>
      </NuxtLink>
    </li>
  </ul>
</template>