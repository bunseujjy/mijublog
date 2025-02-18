<script setup lang="ts">
  import type { User } from '@supabase/supabase-js';
  import { HandHeart, MessageCircleDashed, NotebookPen, Pin } from 'lucide-vue-next';
  import { formattedDate } from '~/lib/formattedDate';
  import type { BlogData } from '~/lib/type';

  const props = defineProps<{
    blog_db: BlogData[];
    user: User | null;
    findPostAuthor: (author_id: string) => void | User;
    currentUser: User | null
  }>()

  // Computed property to filter posts based on visibility and author
  const userPosts = computed(() => {
    const filteredPost = props.blog_db.filter((data) => data.author_id === props.user?.id)
    return filteredPost.filter(post => {
      // If user is the author, show all their posts
      if (props.currentUser?.id === post.author_id) {
        return post;
      }
      // For other users, only show public posts
      return post.visibility !== 'private';
    });
  });
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-"); // Replace multiple - with single -
  };
</script>

<template>
  <ul class="space-y-8 w-full" v-if="userPosts.length > 0">
    <li v-for="blog in userPosts.sort((a,b) => +b.pin - +a.pin)" :key="blog.id"
      class="border-b border-b-muted pb-5 transition-all duration-300 ease-in-out mt-5">
      <div v-if="blog.pin === true" class="flex items-center text-muted-foreground dark:text-muted mb-5"><Pin class="rotate-45" :size="20"/> <span class="pl-2">Pinned</span></div>
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div class="text-black dark:text-white flex-grow mr-4">
          <div class="flex items-center">
            <NuxtLink :to="`/@${findPostAuthor(blog.author_id)?.user_metadata.username}`" class="flex items-center">
              <NuxtImg format="webp" loading="lazy" :src="findPostAuthor(blog.author_id)?.user_metadata
                ?.profile_url || '/post_placeholder.png'
                " :alt="'blog ' + blog.id" class="size-[35px] bg-center object-cover rounded-full mt-4 md:mt-0"
                :placeholder="15" sizes="100vw sm:50vw md:35px" />
              <p class="pl-2">
                {{
                  findPostAuthor(blog.author_id)?.user_metadata
                    ?.username
                }}
              </p>
            </NuxtLink>
          </div>
          <div class="w-full mt-4">
            <NuxtLink :to="`/post/@${findPostAuthor(blog.author_id)?.user_metadata.username}/${blog.id}`" class="inline">
              <h2 class="inline text-md md:text-xl font-bold">{{ blog.title }}</h2>
            </NuxtLink>
            <p class="text-sm mt-2">
              {{
                blog.subtitle.length > 140
                  ? blog.subtitle.slice(0, 140) + "..."
                  : blog.subtitle
              }}
            </p>
            <div class="mt-2">
              <p class="text-xs">
                {{ formattedDate(blog.publish_date) }}
                <span class="text-purple-500 mx-2">•</span>
                <span v-for="(tag, index) in blog.tags" :key="index" class="text-red-400">
                  <NuxtLink :to="`/categories/${slugify(tag)}`" class="hover:underline">
                    {{ tag }} </NuxtLink><span class="text-black dark:text-white">{{
                      index < blog.tags.length - 1 ? ", " : "" }}</span>
                  </span>
              </p>
            </div>
          </div>
          <div class="flex items-center justify-between w-full mt-4">
            <div class="flex items-center text-black dark:text-white space-x-2 mt-2 mb-3 md:mt-0 md:mb-0">
              <NotebookPen class="text-yellow-500" :size="20" />
              <p class="flex items-center cursor-pointer'">
                <HandHeart :size="20" />
                <span class="pl-2">{{ blog?.likes_count }}</span>
              </p>

              <p class="flex items-center">
                <MessageCircleDashed :size="20" />
                <span class="pl-2">{{ blog?.comments_count }}</span>
              </p>
            </div>
            <div class="flex space-x-2 md:mr-2 mt-2 mb-3 md:mt-0 md:mb-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <SavePostModal :currentUser="currentUser" :blog_db="blog" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <PostOptionDropdown :currentUser="currentUser" :blog_db="blog" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>More</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        <div class="w-full md:w-[250px] aspect-[5/3] flex-shrink-0">
          <NuxtLink :to="`/post/@${findPostAuthor(blog.author_id)?.user_metadata.username}/${blog.id}`">
            <NuxtImg format="webp" loading="lazy" :src="blog.featured_image_url || '/post_placeholder.png'" :alt="'blog ' + blog.id"
              class="w-full h-full object-cover" :placeholder="15" sizes="(min-width: 768px) 250px, 100vw" />
          </NuxtLink>
        </div>
      </div>
    </li>
  </ul>
  <div v-else class="mt-2">
    <div class="text-black dark:text-white">You don't have any blog yet. <NuxtLink to="/new_blog"
        class="text-orange-400 font-semibold">Click here </NuxtLink>to create your first blog</div>
  </div>
</template>