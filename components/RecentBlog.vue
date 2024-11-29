<script lang="ts" setup>
  import type { User } from '@supabase/supabase-js';
  import { formattedDate } from '~/lib/formattedDate';
  import type { BlogData } from '~/lib/type';
  import { getCategories } from '~/server/categories/getCategories';

  const props = defineProps<{
    blogs: BlogData | null;
    blog_db: BlogData[]
    isLoading: boolean;
    isError: boolean;
    currentUser: any
  }>();

  const categories = ref<any[]>([]); // Initialize as an empty array
  const isLoading = ref(true);       // Track loading state
  const isError = ref(false);        // Track error state
  const user = ref<User[]>([]);
  // Computed authorDetails that depends on user data
  let authorDetails = ref<any>(null);

  watchEffect(() => {
    // Only compute authorDetails if user.value is populated and blog_db is available
    if (user.value.length > 0 && props.blog_db.length > 0) {
      authorDetails.value = user.value.find((u) => {
        return props.blog_db.some((b) => String(b.author_id) === String(u.id));
      });
    }
  });

  onMounted(async () => {
    isLoading.value = true;
    try {
      const data = await getCategories();
      if (data) {
        categories.value = data;
      } else {
        isError.value = true; // Set error state if data is null
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      isError.value = true;
    } finally {
      isLoading.value = false;
    }
    try {
      const data = await getAllUser(); // Assuming this returns a Promise<User[]> or User

      if (data) {
        // If data is an array of User objects, spread it into the user array
        user.value = [...data];
      } else {
        isError.value = true; // Set error state if data is null or undefined
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      isError.value = true;
    } finally {
      isLoading.value = false;
    }
  });
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-black dark:text-white text-xl md:text-2xl font-bold">Recent Blogs</h1>

    <!-- Loading State -->
    <div v-if="props.isLoading" class="flex justify-center items-center min-h-[200px]">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>

    <!-- Error State -->
    <div v-if="props.isError" class="text-red-500 text-center py-8">
      <p class="text-lg">Failed to load data. Please try again later.</p>
      <button class="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
        Retry
      </button>
    </div>

    <!-- Blog Content -->
    <div class="w-full flex">
      <div class="w-[60%] flex flex-col gap-10 mt-5">
        <div v-for="blog in props.blog_db" :key="blog.id">
          <div class="flex">
            <NuxtImg :src="blog.featured_image_url" :alt="'blog ' + blog.id"
              class="w-[350px] h-[300px] bg-center object-cover" :placeholder="15" sizes="100vw sm:50vw md:380px" />
            <div class="text-black dark:text-white pl-4">
              <CardHeader class="text-md md:text-xl font-bold pl-0">
                <h1>{{ blog.title }}</h1>
              </CardHeader>
              <CardContent class="border-b border-b-slate-400 text-sm pl-0">
                <p>{{ blog.subtitle.length > 140 ? blog.subtitle.slice(0, 140) + "..." : blog.subtitle }}</p>
              </CardContent>
              <CardFooter class="pl-0 pt-2">
                <p class="text-xs">{{ formattedDate(blog.publish_date) }} <span class="text-purple-500">•</span> <span
                    class="text-red-400">{{ blog.tags.join(', ') }}</span></p>
              </CardFooter>
              <NuxtLink :to="`/post/@${authorDetails?.user_metadata?.username}/${blog.id}`"
                class="border-b border-b-red-500 hover:opacity-50 text-xs cursor-pointer transform duration-300 pb-1">
                Read More</NuxtLink>
            </div>
          </div>

        </div>
      </div>

      <!-- Right Side -->
      <div class="w-[40%] ml-3">
        <div class="mb-4">
          <h1 class="text-sm md:text-md text-muted-foreground">What's hot</h1>
          <h2 class="text-black dark:text-white text-md md:text-lg font-bold">Most Popular</h2>
          <div v-for="blog in props.blogs?.dramas.slice(0, 4)" :key="blog.rank">
            <div class="my-4">
              <span :class="[
                'text-white text-xs rounded-full px-2 py-[1px]',
                { 'bg-pink-400': blog.rank === 1 },
                { 'bg-purple-400': blog.rank === 2 },
                { 'bg-yellow-400': blog.rank === 3 },
                { 'bg-red-400': blog.rank === 4 }
              ]">{{ blog.genre[0] }}</span>
              <p class="text-sm md:text-md text-muted-foreground font-semibold my-1">{{ blog.description.length > 200 ?
                blog.description.slice(0, 200) + "..." : blog.description }}</p>
              <p class="text-sm md:text-md text-muted font-semibold">{{ blog.author }} <span>|</span> <span
                  class="text-red-400">{{ blog.release_date }}</span></p>
            </div>
          </div>
        </div>
        <div class="mb-4">
          <h1 class="text-black dark:text-white text-md md:text-lg font-bold">Pick your Categories</h1>
          <div class="flex items-center">

            <ul v-for="cat in categories.slice(0, 5)" :key="cat.id" class="mt-2">
              <li class="bg-purple-400 text-white text-[10px] border border-purple-300 px-2 py-2 rounded-full mr-2">
                <NuxtLink :to="`/categories/${cat.slug}`">{{ cat.name }}</NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <div class="mb-4">
          <h1 class="text-black dark:text-white text-md md:text-lg font-bold">Recommended For You</h1>
          <div class="flex items-center mt-3" v-for="(rec, idx) in props.blogs?.dramas.slice(0, 6)" :key="idx">
            <div class="w-[10%]">
              <NuxtImg src="/jjy.jpg" alt="pf" width="60px" height="60px" class="rounded-full object-cover"
                sizes="100vw sm:50vw md:60px" />
            </div>
            <div class="flex flex-col w-[90%]">
              <div class="my-4 ml-3">
                <span :class="[
                  'text-white text-xs rounded-full px-2 py-[1px]',
                  { 'bg-pink-400': rec.rank === 1 },
                  { 'bg-purple-400': rec.rank === 2 },
                  { 'bg-yellow-400': rec.rank === 3 },
                  { 'bg-red-400': rec.rank === 4 },
                  { ' bg-indigo-400': rec.rank > 4 }
                ]">{{ rec.genre[0] }}</span>
                <p class="text-sm md:text-md text-muted-foreground font-semibold my-1">{{ rec.description.length > 200 ?
                  rec.description.slice(0, 200) + "..." : rec.description }}</p>
                <p class="text-sm md:text-md text-muted font-semibold">{{ rec.author }} <span>|</span> <span>{{
                  rec.release_date }}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>