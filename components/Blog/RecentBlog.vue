<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";
import type { User } from "@supabase/supabase-js";
import { formattedDate } from "~/lib/formattedDate";
import type { BlogData } from "~/lib/type";
import { getCategories } from "~/server/categories/getCategories";
import { getAuthorDetails } from "~/lib/getAuthorDetails";

interface Props {
  blog_db: BlogData[];
  currentUser: User | null;
}
const props = defineProps<Props>();
const blog_db = computed(() => props.blog_db || []);
const categories = ref<any[]>([]);
const user = ref<User[]>([]);
const containerRef = ref<HTMLElement | null>(null);
const isError = ref(false);
const { users } = useAuth();
const {
  isLoading,
  isScrolling,
  paginatedBlogs,
  loadMoreBlogs,
  selectedCategory,
  searchQuery,
} = useBlogPagination(blog_db.value);

useInfiniteScroll(
  containerRef,
  () => {
    if (!isScrolling.value) {
      loadMoreBlogs();
    }
  },
  { distance: 10 }
);

const retryFetch = async () => {
  isLoading.value = true;
  isError.value = false;
  try {
    const [categoriesData, userData] = await Promise.all([
      getCategories(),
      getAllUser(),
    ]);

    if (categoriesData) {
      categories.value = categoriesData;
    } else {
      throw new Error("Failed to fetch categories");
    }

    if (userData) {
      user.value = Array.isArray(userData) ? userData : [userData];
    } else {
      throw new Error("Failed to fetch users");
    }
  } catch (err) {
    console.error("Failed to fetch data:", err);
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const getTagColor = (index: number) => {
  const colors = [
    "bg-pink-400",
    "bg-purple-400",
    "bg-yellow-400",
    "bg-red-400",
    "bg-indigo-400",
  ];
  return colors[index % colors.length];
};

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};

onMounted(async () => {
  isLoading.value = true;
  try {
    const [categoriesData, userData] = await Promise.all([
      getCategories(),
      getAllUser(),
    ]);

    if (categoriesData) {
      categories.value = categoriesData;
    } else {
      throw new Error("Failed to fetch categories");
    }

    if (userData) {
      user.value = Array.isArray(userData) ? userData : [userData];
    } else {
      throw new Error("Failed to fetch users");
    }
  } catch (err) {
    console.error("Failed to fetch data:", err);
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div
    class="container mx-auto px-4 py-8 md:px-0 transition-colors duration-300"
    ref="containerRef"
    id="blog_post"
  >
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-black dark:text-white text-2xl md:text-3xl font-bold">
        Recent Blogs
      </h1>
    </div>

    <div class="mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search blogs..."
        class="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
      />
    </div>

    <div class="mb-6 flex items-center flex-wrap gap-2">
      <h4 class="text-black dark:text-purple-400 font-semibold">
        Filter By Categories:
      </h4>
      <button
        v-for="cat in categories.slice(0, 6)"
        :key="cat.id"
        @click="selectedCategory = cat.name"
        :class="[
          'px-3 py-1 rounded-full text-sm transition-colors duration-300',
          selectedCategory === cat.name
            ? 'bg-purple-500 text-white'
            : 'text-white  bg-gray-400 dark:bg-gray-700 dark:text-gray-300',
        ]"
      >
        {{ cat.name }}
      </button>
      <button
        type="button"
        class="text-muted bg-orange-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm transition-colors duration-300 hover:bg-opacity-70"
        @click="selectedCategory = ''"
      >
        Reset
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex justify-center items-center min-h-[200px]"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"
      ></div>
    </div>

    <!-- Error State -->
    <div v-if="isError" class="text-red-500 text-center py-8">
      <p class="text-lg">Failed to load data. Please try again later.</p>
      <button
        @click="retryFetch"
        class="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
      >
        Retry
      </button>
    </div>

    <!-- Blog Content -->
    <div v-if="!isLoading && !isError" class="w-full flex flex-col lg:flex-row">
      <RecentBlogLoading v-if="isLoading" />
      <div class="w-full lg:w-[70%] flex flex-col gap-10 mt-5">
        <div v-if="paginatedBlogs.length > 0">
          <TransitionGroup name="list" tag="div">
            <div
              v-for="blog in paginatedBlogs"
              :key="blog.id"
              class="border-b border-b-muted pb-5 transition-all duration-300 ease-in-out mt-5"
            >
              <div
                class="flex flex-col md:flex-row items-start md:items-center justify-between"
              >
                <div class="text-black dark:text-white flex-grow space-y-2">
                  <div class="flex items-center">
                    <NuxtImg format="webp" loading="lazy"
                      :src="
                        getAuthorDetails(users, blog.author_id)?.user_metadata
                          ?.profile_url || '/default-pf.jpg'
                      "
                      :alt="'blog ' + blog.id"
                      class="size-[35px] bg-center object-cover rounded-full mt-4 md:mt-0"
                      :placeholder="15"
                      sizes="100vw sm:50vw md:35px"
                      quality="80"
                    />
                    <p class="pl-2">
                      {{
                        getAuthorDetails(users, blog.author_id)?.user_metadata
                          ?.username
                      }}
                    </p>
                  </div>
                  <h2 class="text-md md:text-xl font-bold">{{ blog.title }}</h2>
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
                      <span
                        v-for="(tag, index) in blog.tags"
                        :key="index"
                        class="text-red-400"
                      >
                        <NuxtLink
                          :to="`/categories/${slugify(tag)}`"
                          class="hover:underline"
                        >
                          {{ tag }} </NuxtLink
                        ><span class="text-black dark:text-white">{{
                          index < blog.tags.length - 1 ? ", " : ""
                        }}</span>
                      </span>
                    </p>
                  </div>
                  <NuxtLink
                    :to="`/post/@${getAuthorDetails(user, blog.author_id)?.user_metadata?.username}/${blog.id}`"
                    class="inline-block mt-2 border-b border-b-red-500 hover:opacity-50 text-xs cursor-pointer transform duration-300 pb-1"
                  >
                    Read More
                  </NuxtLink>
                </div>
                <div class="w-full md:w-[250px] aspect-[5/3] flex-shrink-0">
                  <NuxtImg format="webp" loading="lazy"
                    :src="blog.featured_image_url || '/post_placeholder.png'"
                    :alt="'blog ' + blog.id"
                    class="w-full h-full object-cover"
                    :placeholder="15"
                    sizes="(min-width: 768px) 250px, 100vw"
                  />
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <div v-else class="text-black dark:text-slate-400 text-sm">
          No blog available at the moment.😥
        </div>
        <div v-if="isScrolling" class="text-center py-4">
          <div
            class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"
          ></div>
        </div>
      </div>

      <!-- Right Side -->
      <div class="w-full lg:w-[30%] mt-10 lg:mt-0 lg:ml-3">
        <div class="mb-8">
          <h2 class="text-black dark:text-white text-xl font-bold mb-4">
            What's Hot
          </h2>
          <div v-if="props.blog_db.length > 0">
            <div
              v-for="(blog, idx) in props.blog_db
                ?.slice(0, 4)
                .filter((data) => data.visibility !== 'private')"
              :key="blog.id"
              class="mb-4"
            >
              <NuxtLink :to="`/categories/${blog.tags[0].toLocaleLowerCase()}`">
                <span
                  :class="[
                    'text-white text-xs rounded-full px-2 py-[1px]',
                    getTagColor(idx),
                  ]"
                  >{{ blog.tags[0] }}</span
                >
              </NuxtLink>
              <NuxtLink
                :to="`/post/@${getAuthorDetails(users, blog.author_id)?.user_metadata?.username}/${blog.id}`"
              >
                <p
                  class="text-sm text-gray-700 dark:text-gray-300 font-semibold my-1"
                >
                  {{
                    blog.subtitle.length > 100
                      ? blog.subtitle.slice(0, 100) + "..."
                      : blog.subtitle
                  }}
                </p>
              </NuxtLink>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{
                  getAuthorDetails(users, blog.author_id)?.user_metadata
                    ?.username
                }}
                <span class="mx-1">|</span>
                <span class="text-red-400">{{ blog.publish_date }}</span>
              </p>
            </div>
          </div>
          <div v-else class="text-black dark:text-slate-400 text-sm">
            No blog available at the moment.😥
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-black dark:text-white text-xl font-bold mb-4">
            Categories
          </h2>
          <div class="flex flex-wrap gap-2">
            <NuxtLink
              v-for="cat in categories.slice(0, 5)"
              :key="cat.id"
              :to="`/categories/${cat.slug}`"
              class="bg-purple-400 hover:bg-purple-500 text-white text-xs px-3 py-1 rounded-full transition-colors duration-300"
            >
              {{ cat.name }}
            </NuxtLink>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-black dark:text-white text-xl font-bold mb-4">
            Recommended For You
          </h2>
          <div v-if="props.blog_db?.length > 0">
            <div
              v-for="(rec, idx) in props.blog_db
                ?.slice(0, 6)
                .filter((data) => data.visibility !== 'private')"
              :key="idx"
              class="flex items-start mb-4"
            >
              <div class="flex-shrink-0 mr-1">
                <NuxtLink
                  :to="`/@${getAuthorDetails(users, rec.author_id)?.user_metadata?.username}`"
                >
                  <NuxtImg format="webp" loading="lazy"
                    :src="
                      getAuthorDetails(users, rec.author_id)?.user_metadata
                        ?.profile_url || '/default-pf.jpg'
                    "
                    :alt="`${getAuthorDetails(users, rec.author_id)?.user_metadata?.username}'s profile`"
                    class="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                </NuxtLink>
              </div>
              <div>
                <NuxtLink
                  :to="`/categories/${rec.tags[0].toLocaleLowerCase()}`"
                >
                  <span
                    :class="[
                      'text-white text-xs rounded-full px-2 py-[1px] mb-1 inline-block',
                      getTagColor(idx),
                    ]"
                    >{{ rec.tags[0] }}</span
                  >
                </NuxtLink>
                <NuxtLink
                  :to="`/post/@${getAuthorDetails(users, rec.author_id)?.user_metadata?.username}/${rec.id}`"
                >
                  <p
                    class="text-sm text-gray-700 dark:text-gray-300 font-semibold"
                  >
                    {{
                      rec.subtitle.length > 100
                        ? rec.subtitle.slice(0, 100) + "..."
                        : rec.subtitle
                    }}
                  </p>
                </NuxtLink>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{
                    getAuthorDetails(users, rec.author_id)?.user_metadata
                      ?.username
                  }}
                  <span class="mx-1">|</span>
                  <span>{{ rec.publish_date }}</span>
                </p>
              </div>
            </div>
          </div>

          <div v-else class="text-black dark:text-slate-400 text-sm">
            No blog available at the moment.😥
          </div>
        </div>
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
