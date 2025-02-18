<script setup lang="ts">
  import { useInfiniteScroll } from "@vueuse/core";
  import { formattedDate } from "~/lib/formattedDate";
  import { getAuthorDetails } from "~/lib/getAuthorDetails";
  import type { BlogData } from "~/lib/type";
  import type { User } from '@supabase/supabase-js'
  import { NotebookPen, HandHeart, MessageCircleDashed } from "lucide-vue-next";

  const props = defineProps<{
    blog_db: BlogData[];
  }>();

  const { users, user: currentUser } = useAuth()
  const loadMoreTrigger = ref<HTMLElement | null>(null)
  const isError = ref(false)
  const {
    isLoading,
    isScrolling,
    paginatedBlogs,
    loadMoreBlogs,
  } = useBlogPagination(props.blog_db)

  const retryFetch = async () => {
    isError.value = false
    try {
      await getAllUser()
    } catch (err) {
      console.error('Failed to fetch data:', err)
      isError.value = true
    }
  }

  // Setup intersection observer for infinite scroll
  useInfiniteScroll(
    loadMoreTrigger,
    () => {
      if (!isScrolling.value) {
        loadMoreBlogs();
      }
    },
    { distance: 10 }
  );

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
  <div class="transition-colors duration-300" ref="loadMoreTrigger" id="blog_post">
    <!-- Loading State -->
    <div v-if="isLoading && !paginatedBlogs.length" class="flex justify-center items-center min-h-[200px]">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>

    <!-- Error State -->
    <div v-if="isError" class="text-red-500 text-center py-8">
      <p class="text-lg">Failed to load data. Please try again later.</p>
      <button @click="retryFetch"
        class="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && !isError && !paginatedBlogs.length" 
      class="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <NotebookPen class="text-purple-500 mb-4" :size="48" />
      <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">No Posts Yet</h2>
      <p class="text-gray-600 dark:text-gray-400 max-w-md">
        Looks like there aren't any posts available at the moment. Check back later for new content!
      </p>
    </div>

    <!-- Blog Content -->
    <div v-if="!isLoading && !isError && paginatedBlogs.length > 0" class="w-full flex flex-col lg:flex-row">
      <AllBlogPostLoading v-if="isLoading" />
      <div class="w-full lg:w-[70%] flex flex-col gap-10 mt-5">
        <TransitionGroup name="list" tag="div">
          <div v-for="blog in paginatedBlogs" :key="blog.id"
            class="border-b border-b-muted pb-5 transition-all duration-300 ease-in-out mt-5">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div class="text-black dark:text-white flex-grow mr-4">
                <div class="flex items-center">
                  <NuxtLink :to="`/@${getAuthorDetails(users, blog.author_id)?.user_metadata.username}`"
                    class="flex items-center">
                    <NuxtImg format="webp" loading="lazy" :src="getAuthorDetails(users, blog.author_id)?.user_metadata
                      ?.profile_url || '/post_placeholder.png'
                      " :alt="'blog ' + blog.id" class="size-[35px] bg-center object-cover rounded-full mt-4 md:mt-0"
                      :placeholder="15" sizes="100vw sm:50vw md:35px" />
                    <p class="pl-2">
                      {{
                        getAuthorDetails(users, blog.author_id)?.user_metadata
                          ?.username
                      }}
                    </p>
                  </NuxtLink>
                </div>
                <div class="w-full mt-4">
                  <NuxtLink
                    :to="`/post/@${getAuthorDetails(users, blog.author_id)?.user_metadata.username}/${blog.id}`">
                    <h2 class="text-md md:text-xl font-bold">{{ blog.title }}</h2>
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
                <NuxtLink :to="`/post/@${getAuthorDetails(users, blog.author_id)?.user_metadata.username}/${blog.id}`">
                  <NuxtImg format="webp" loading="lazy" :src="blog.featured_image_url || '/post_placeholder.png'" :alt="'blog ' + blog.id"
                    class="w-full h-full object-cover" :placeholder="15" sizes="(min-width: 768px) 250px, 100vw" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </TransitionGroup>
        <!-- Loading More Indicator - Fixed position at bottom -->
        <div v-if="isLoading && paginatedBlogs.length"
          class="sticky bottom-0 text-center py-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        </div>

        <!-- Intersection Observer Target -->
        <div v-if="isScrolling" class="text-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      </div>
      <div class="border-r border-r-muted px-4" />
      <div class="w-full md:w-[30%] h-[100vh] flex flex-col mt-14">
        <AllBlogRightSide :users="users" :currentUser="currentUser" :blog_db="blog_db" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>