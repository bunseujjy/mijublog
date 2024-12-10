<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
  import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
  import type { BlogData } from '~/lib/type';
  import type { User } from '@supabase/supabase-js';
import { getAuthorDetails } from '~/lib/getAuthorDetails';

  const props = defineProps<{
    blog_db?: BlogData[];
    isLoading: boolean;
  }>()

  const currentIndex = ref(0)
  const isHovering = ref(false)
  const users = ref<User[]>([])

  const featuredBlogs = computed(() => {
    if (!props.blog_db) return []
    return props.blog_db.slice(0, Math.min(4, props.blog_db.length))
  })

  const nextSlide = () => {
    currentIndex.value = (currentIndex.value + 1) % featuredBlogs.value.length
  }

  const prevSlide = () => {
    currentIndex.value = (currentIndex.value - 1 + featuredBlogs.value.length) % featuredBlogs.value.length
  }

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  let intervalId: ReturnType<typeof setInterval> | null = null

  const startAutoSlide = () => {
    if (featuredBlogs.value.length > 1) {
      intervalId = setInterval(() => {
        if (!isHovering.value) {
          nextSlide()
        }
      }, 5000)
    }
  }

  const stopAutoSlide = () => {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  onMounted(async () => {
    startAutoSlide()
    try {
      const data = await getAllUser(); // Assuming this returns a Promise<User[]> or User

      if (data) {
        // If data is an array of User objects, spread it into the user array
        users.value = [...data];
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  })

  onUnmounted(() => {
    stopAutoSlide()
  })

  watch(() => props.blog_db, () => {
    currentIndex.value = 0
    stopAutoSlide()
    startAutoSlide()
  })
</script>


<template>
  <section class="w-full my-10 px-4 md:px-0">
    <h2 class="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">Featured Blogs</h2>
    <div v-if="!props.isLoading">
      <div v-if="!blog_db || blog_db.length === 0" class="text-gray-600 dark:text-gray-300">
        No featured blogs available at the moment.
      </div>
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div v-if="featuredBlogs.length > 0" class="relative h-full" @mouseenter="isHovering = true"
          @mouseleave="isHovering = false">
          <TransitionGroup name="fade">
            <div v-for="(blog, index) in featuredBlogs" :key="blog.id" v-show="index === currentIndex"
              class="absolute inset-0">
              <div class="relative h-full overflow-hidden rounded-lg">
                <NuxtImg :src="blog.featured_image_url" :alt="blog.title"
                  class="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div class="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                  <span
                    class="absolute top-0 block px-2 py-1 mb-2 text-xs font-semibold bg-purple-500 text-white rounded-full">{{
                    blog.tags[0] }}</span>
                  <h3 class="text-2xl md:text-3xl font-bold text-white mb-2">{{ blog.title }}</h3>
                  <p class="text-lg text-gray-200 mb-4">
                    {{ blog.subtitle.length > 140 ? `${blog.subtitle.slice(0, 140)}...` : blog.subtitle }}
                  </p>
                  <div class="flex items-center justify-between">
                    <p class="text-sm text-gray-300">
                      By {{ getAuthorDetails(users, blog.author_id)?.user_metadata?.username }} | {{
                        formatDate(blog.publish_date) }}
                    </p>
                    <NuxtLink :to="`/post/@${getAuthorDetails(users, blog.author_id)?.user_metadata?.username}/${blog.id}`"
                      class="px-4 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
                      Read More
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </TransitionGroup>
          <button v-if="featuredBlogs.length > 1" @click="prevSlide"
            class="absolute top-1/2 left-4 -translate-y-1/2 z-30 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
            <ChevronLeft class="h-6 w-6" />
            <span class="sr-only">Previous slide</span>
          </button>
          <button v-if="featuredBlogs.length > 1" @click="nextSlide"
            class="absolute top-1/2 right-4 -translate-y-1/2 z-30 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
            <ChevronRight class="h-6 w-6" />
            <span class="sr-only">Next slide</span>
          </button>
        </div>
        <div class="space-y-4">
          <div v-for="blog in featuredBlogs.slice(1)" :key="blog.id"
            class="flex overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <NuxtImg :src="blog.featured_image_url" :alt="blog.title" class="w-[200px] h-[166.66667px] object-cover"
              loading="lazy" />
            <div class="flex-1 p-4">
              <span class="inline-block px-2 py-1 mb-2 text-xs font-semibold bg-purple-500 text-white rounded-full">{{
                blog.tags[0] }}</span>
              <h4 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{{ blog.title }}</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {{ blog.subtitle.length > 100 ? `${blog.subtitle.slice(0, 100)}...` : blog.subtitle }}
              </p>
              <div class="flex items-center justify-between">
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(blog.publish_date) }}
                </p>
                <NuxtLink :to="`/post/@${getAuthorDetails(users, blog.author_id)?.user_metadata?.username}/${blog.id}`" class="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                  Read More
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <FeatureBlogLoading />
    </div>
  </section>
</template>

<style scoped>

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>