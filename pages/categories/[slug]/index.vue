<script setup lang="ts">
import type { User } from '@supabase/supabase-js';
import { Gem, GripHorizontal, HandHeart, MessageCircleDashed, MessageSquareShare, Waypoints } from 'lucide-vue-next';
import { formattedDate } from '~/lib/formattedDate';
import { getAuthorDetails } from '~/lib/getAuthorDetails';
import type { BlogData } from '~/lib/type';
import { followCategory } from '~/server/categories/followCategory';
import { getBlogByCategories } from '~/server/categories/getBlogByCategory';
import { getCategories } from '~/server/categories/getCategories';
import { getCategory } from '~/server/categories/getCategory';
import { getCategoryFollowedBy } from '~/server/categories/getCategoryFollowedBy';

const client = useSupabaseClient();
const {user: currentUser} = useAuth()
const categories = ref<any[]>([]);
const category = ref();
const selectedCategory = ref('')
const blog_db = ref<BlogData[]>([])
const user = ref<User[]>([]);
const isCategoryLoading = ref(true);
const isBlogLoading = ref(false);
const isError = ref(false);
const route = useRoute()
const category_slug = computed(() => route.params.slug);
const isCurrentUserFollowing = ref<any[]>([])
const errorMsg = ref('')
const showErrorMsg = ref(false)

const filteredBlogs = computed(() => {
    return blog_db.value.filter(blog => 
      (selectedCategory.value === '' || blog.tags.includes(selectedCategory.value))
    )
})

watchEffect(() => {
  if(selectedCategory.value !== '') {
    navigateTo(`/categories/${selectedCategory.value}`)
  }
});

const placeholderItems = computed(() => {
  return Array.from({ length:  3 }, (_, index) => index + 1);
});

watch(category_slug, async (newSlug: ComputedRef<string | string[]>) => {
  if (newSlug) {
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
      isCategoryLoading.value = false;
    }
    try {
      isBlogLoading.value = true;
      showErrorMsg.value = false; // Reset error message visibility
      const blog_data = await getBlogByCategories(category.value?.name);
      if (blog_data) {
        blog_db.value = blog_data;
      }  else {
        isError.value = true; // Set error state if data is null
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      isError.value = true;
    } finally {
      isBlogLoading.value = false;
      // Check for empty blogs after loading is complete
      if (filteredBlogs.value.length === 0) {
        errorMsg.value = "This category does not have any post related to it yet!";
        showErrorMsg.value = true;
      } else {
        showErrorMsg.value = false;
      }
    }
  }
}, { immediate: true });

watch([category, currentUser], async ([newCategory, newUser]) => {
  if (newCategory?.id && newUser?.id) {
    const categoryFollowed = await getCategoryFollowedBy(
      newCategory.id,
      newUser.id
    );
    isCurrentUserFollowing.value = categoryFollowed || [];
  }
});

onMounted(async () => {
  try {
    const [cat, users] = await Promise.all([getCategories(), getAllUser()]);
    categories.value = cat || [];
    user.value = users || [];

    if (category.value?.id && currentUser.value?.id) {
      const categoryFollowed = await getCategoryFollowedBy(
        category.value.id,
        currentUser.value.id
      );
      isCurrentUserFollowing.value = categoryFollowed || [];
    } else {
      console.warn("Category ID or User ID is undefined");
    }
  } catch (err) {
    console.error("Failed to fetch categories or users:", err);
    isError.value = true;
  } finally {
    isCategoryLoading.value = false;
  }
  client.channel("category_followed_by").on('postgres_changes', {event: '*', schema: 'public', table: 'category_followed_by'}, (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    if (eventType === 'INSERT') {
    isCurrentUserFollowing.value = [...isCurrentUserFollowing.value, newRecord];
  } else if (eventType === 'DELETE') {
    isCurrentUserFollowing.value = isCurrentUserFollowing.value.filter((item) => item.id !== oldRecord.id);
  }
  }).subscribe();
  client.channel("categories").on('postgres_changes', {event: 'UPDATE', schema: 'public', table: 'categories'}, (payload) => {
    const { new: newRecord } = payload;
    category.value.followers = newRecord.followers
  }).subscribe()
});

onBeforeUnmount(() => {
  client.channel("category_followed_by").unsubscribe();
  client.channel("categories").unsubscribe();
});
</script>

<template>
    <div class="flex flex-col px-4 max-w-screen-xl mx-auto md:px-8 mt-10">
        <div class="flex items-center text-white">
            <NuxtLink to="/explore-topics" class="flex items-center text-sm text-black dark:text-white border border-black dark:border-muted rounded-full px-3 py-1 mr-2"><Waypoints :size="19" class="mr-2"/> Explore Categories </NuxtLink>
            <div class="" v-for="cat in categories.slice(0, 9)" :key="cat.id">
                <p :class="['text-sm text-black dark:text-white border border-black dark:border-muted rounded-full hover:bg-white hover:text-black transform duration-300 px-3 py-1 mx-2 cursor-pointer', {
                  'text-white bg-muted-foreground border-muted-foreground' : category_slug === cat?.slug
                }]" @click="selectedCategory = cat.slug">{{ cat.name }}</p>
            </div>
        </div>
        <div class="flex items-center flex-col text-black dark:text-white my-10">
           <h1 class="text-xl md:text-4xl font-bold">{{ category?.name }}</h1>
           <h2 class="py-5 text-md md:text-lg"><span>{{ category?.followers }} Followers</span><span> · </span><span>{{ category?.post_length }} Posts</span></h2>
           <div v-if="isCurrentUserFollowing.find((u) => u.user_id !== currentUser?.id) || isCurrentUserFollowing.length === 0">
             <button type="button" class="border border-muted bg-black text-white rounded-full  hover:bg-white hover:text-black transform duration-300 px-3 py-1" @click="followCategory(1, category.id, currentUser?.id ?? '')">Follow</button>
           </div>
           <div v-else>
            <button type="button" class="border border-muted bg-black text-white rounded-full  hover:bg-white hover:text-black transform duration-300 px-3 py-1" @click="followCategory(1, category.id, currentUser?.id ?? '')">Following</button>
           </div>
        </div>
        <div class="text-white mt-5 mb-10">
          <h1 class="text-lg md:text-2xl font-semibold">Recommended Topics</h1>
          <div v-if="!isBlogLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="blog in filteredBlogs" :key="blog.id" class="my-4">
              <div class="w-full h-full">
                <NuxtImg :src="blog.featured_image_url" alt="preview_img" densities="1x 2x" format="webp" quality="80" class="w-full h-[200px] object-cover"/>
                <div class="flex items-center justify-between mt-2">
                  <div class="flex items-center">
                    <NuxtImg :src="getAuthorDetails(user, blog?.author_id)?.user_metadata.profile_url" alt="profile_img" densities="1x 2x" format="webp" quality="80" class="size-[35px] object-cover rounded-full"/>
                    <p class="text-black dark:text-white pl-2">{{ getAuthorDetails(user, blog?.author_id)?.user_metadata?.username }}</p>
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
          <div v-else v-for="n in placeholderItems" :key="n">
            <PostByCategories />
          </div>
          <div v-if="showErrorMsg && !isBlogLoading">
            <p class="text-lg md:text-2xl text-center my-24 uppercase">
             {{ errorMsg }}
            </p>
          </div>
        </div>
    </div>
</template>