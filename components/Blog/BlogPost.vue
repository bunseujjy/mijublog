<script setup lang="ts">
import type { User } from '@supabase/supabase-js';
import type { BlogData } from '~/lib/type';
import { formattedDate } from '~/lib/formattedDate';

defineProps<{
  post: BlogData;
  author: User | undefined;
}>();
</script>

<template>
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div class="text-black dark:text-white flex-grow space-y-2">
          <div class="flex items-center pb-2">
            <NuxtImg format="webp" loading="lazy" :src="author?.user_metadata?.profile_url || '/post_placeholder.png'" :alt="'post ' + post.id"
            class="size-[35px] bg-center object-cover rounded-full mt-4 md:mt-0"
            :placeholder="15" sizes="100vw sm:50vw md:35px" />
            <p class="pl-2">{{ author?.user_metadata?.username }}</p>
          </div>
          <NuxtLink :to="`/post/@${author?.user_metadata?.username}/${post.id}`" class="text-md md:text-xl font-bold">{{ post.title }}</NuxtLink>
          <p class="text-sm mt-3">{{ post.subtitle.length > 140 ? post.subtitle.slice(0, 140) + "..." : post.subtitle }}</p>
          <div class="mt-2">
            <p class="text-xs">{{ formattedDate(post.publish_date) }} <span class="text-purple-500">•</span> <span
                class="text-red-400">{{ post.tags.join(', ') }}</span></p>
          </div>
          <NuxtLink :to="`/post/@${author?.user_metadata?.username}/${post.id}`"
            class="inline-block mt-2 border-b border-b-red-500 hover:opacity-50 text-xs cursor-pointer transform duration-300 pb-1">
            Read More
          </NuxtLink>
        </div>
        <div class="w-full md:w-[250px] aspect-[5/3] flex-shrink-0">
            <img format="webp" loading="lazy" 
              :src="post.featured_image_url || '/post_placeholder.png'" 
              :alt="'post ' + post.id"
              class="w-full h-full object-cover"
              sizes="(min-width: 768px) 250px, 100vw" 
            />
          </div>
      </div>
</template>