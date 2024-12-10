<script setup lang="ts">
import type { User } from '@supabase/supabase-js';
import { formattedDate } from '~/lib/formattedDate';
import type { BlogData } from '~/lib/type';
defineProps<{
    blog_db: BlogData[];
    user: User | null;
    findPostAuthor: (author_id: string) => void | User;
}>()
</script>

<template>
        <ul class="space-y-8 w-full">
          <li v-for="post in blog_db.filter((p) => user?.id === p.author_id)" :key="post.id"
            class="w-[70%] bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden p-4">
            <div class="flex flex-col">
              <div class="flex items-center justify-between">
                <div class="text-black dark:text-white pl-4">
                  <CardHeader class="text-md md:text-xl font-bold pl-0">
                    <h1>{{ post.title }}</h1>
                  </CardHeader>
                  <CardContent class="border-b border-b-slate-400 text-sm pl-0 mr-5">
                    <p>
                      {{
                        post.subtitle.length > 140
                          ? post.subtitle.slice(0, 140) + "..."
                          : post.subtitle
                      }}
                    </p>
                  </CardContent>
                  <CardFooter class="pl-0 pt-2">
                    <p class="text-xs">
                      {{ formattedDate(post.publish_date) }}
                      <span class="text-purple-500">•</span>
                      <span class="text-red-400">{{
                        post.tags.join(", ")
                      }}</span>
                    </p>
                  </CardFooter>
                  <NuxtLink :to="`post/@${findPostAuthor(post.author_id)?.user_metadata.username}/${post.id}`"
                    class="border-b border-b-red-500 hover:opacity-50 text-xs cursor-pointer transform duration-300 pb-1">
                    Read More</NuxtLink>
                </div>

                <NuxtImg :src="post.featured_image_url" :alt="'post ' + post.id" :placeholder="15"
                  sizes="100vw sm:50vw md:380px" class="w-[250px] h-[150px] bg-center object-cover" />
              </div>
            </div>
          </li>
        </ul>
</template>