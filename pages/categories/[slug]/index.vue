<script setup lang="ts">
import type { User } from '@supabase/supabase-js';
import { Gem, GripHorizontal, HandHeart, MessageCircleDashed, MessageSquareShare, Waypoints } from 'lucide-vue-next';
import { formattedDate } from '~/lib/formattedDate';
import type { BlogData } from '~/lib/type';
import { getBlogByCategories } from '~/server/categories/getBlogByCategory';
import { getCategories } from '~/server/categories/getCategories';
import { getCategory } from '~/server/categories/getCategory';

const categories = ref<any[]>([]);
const category = ref();
const blog_db = ref<BlogData[]>([])
  const user = ref<User[]>([]);
const isLoading = ref(true);
const isError = ref(false);
const route = useRoute()
const category_slug = computed(() => route.params.slug);
let authorDetails = ref<any>(null);

watchEffect(() => {
  // Only compute authorDetails if user.value is populated and blog_db is available
  if (user.value.length > 0 && blog_db.value.length > 0) {
    authorDetails.value = user.value.find((u) => {
      return blog_db.value.some((b) => String(b.author_id) === String(u.id));
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
watch(category_slug, async (newSlug: ComputedRef<string | string[]>) => {
  console.log("Watching category slug:", newSlug);  // Debug log for the new slug
  if (newSlug) {
    isLoading.value = true;
    try {
      const data = await getCategory(newSlug);
      if (data) {
        category.value = data;
        console.log("Category data fetched:", category.value);  // Debug the fetched category
      } else {
        console.error("Category not found");
      }
    } catch (err) {
      console.error('Error fetching category:', err);
      isError.value = true;
    } finally {
      isLoading.value = false;
    }
    try {
    const blog_data = await getBlogByCategories(category.value?.name);
    if (blog_data) {
      blog_db.value = blog_data;
    } else {
      isError.value = true; // Set error state if data is null
    }
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
  }
}, { immediate: true });
</script>

<template>
    <div class="flex flex-col px-4 max-w-screen-xl mx-auto md:px-8 mt-10">
        <div class="flex items-center text-white">
            <p class="flex items-center text-sm text-black dark:text-white border border-black dark:border-muted rounded-full px-3 py-1 mr-2"><Waypoints :size="19" class="mr-2"/> Explore Categories </p>
            <div class="" v-for="cat in categories.slice(0, 9)" :key="cat.id">
                <p class="text-sm text-black dark:text-white border border-black dark:border-muted rounded-full px-3 py-1 mx-2">{{ cat.name }}</p>
            </div>
        </div>
        <div class="flex items-center flex-col text-black dark:text-white my-10">
           <h1 class="text-xl md:text-4xl font-bold">{{ category?.name }}</h1>
           <h2 class="py-5 text-md md:text-lg"><span>{{ category?.followers }} Followers</span><span> · </span><span>{{ category?.post_length }} Posts</span></h2>
           <button type="button" class="border border-muted bg-black text-white rounded-full hover:opacity-60 transform duration-300 px-3 py-1">Follow</button>
        </div>
        <div class="text-white mt-5 mb-10">
          <h1 class="text-lg md:text-2xl font-semibold">Recommended Topics</h1>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="blog in blog_db" :key="blog.id" class="my-4">
              <div class="w-full h-full">
                <NuxtImg :src="blog.featured_image_url" alt="preview_img" densities="1x 2x" format="webp" quality="80" class="w-full h-[200px] object-cover"/>
                <div class="flex items-center justify-between mt-2">
                  <div class="flex items-center">
                    <NuxtImg :src="authorDetails?.user_metadata.profile_url" alt="profile_img" densities="1x 2x" format="webp" quality="80" class="size-[35px] object-cover rounded-full"/>
                    <p class="text-black dark:text-white pl-2">{{ authorDetails?.user_metadata?.username }}</p>
                  </div>
                  <p class="text-sm text-black dark:text-white pl-2">{{ formattedDate(blog?.publish_date) }}</p>
                </div>
                <div class="mt-2">
                  <h1 class="text-black dark:text-white font-bold mt-1 py-2">{{ blog?.title?.length > 100 ? blog?.title?.slice(0, 100) + "..." : blog?.title }}</h1>
                  <p class="text-[#6B6B6B] dark:text-white dark:text-opacity-80 font-semibold pb-2">{{ blog?.subtitle?.length > 160 ? blog?.subtitle?.slice(0, 160) + "..." : blog?.subtitle }}</p>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center text-black dark:text-white space-x-2 mt-2">
                      <Gem class="text-yellow-300" :size="20"/>
                      <p class="flex items-center"><HandHeart /> <span class="pl-2">{{blog?.likes_count}}</span></p>
                      <p class="flex items-center"><MessageCircleDashed /> <span class="pl-2">{{ blog?.comments_count }}</span></p>
                    </div>
                    <div class="flex space-x-2">
                      <MessageSquareShare />
                      <GripHorizontal />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
</template>