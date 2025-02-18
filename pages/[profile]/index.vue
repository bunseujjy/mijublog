<script setup lang="ts">
import { ArrowLeft, UserIcon, UserPen, UserX } from "lucide-vue-next";
import type { User } from "@supabase/supabase-js";
import { formattedDate } from "~/lib/formattedDate";
import { getLists } from "~/server/list/getLists";
import { getSavedPost } from "~/server/post/getSavedPost";
import { getRecentPost } from "~/server/post/getRecentBlog";
import type { BlogData, Lists, PublicUser, SavedPosts } from "~/lib/type";
import { getPublicUser } from "~/server/user/getPublicUser";

const route = useRoute();
const { user: currentUser } = useAuth();
const supabase = useSupabaseClient();
const user = ref<User | null>(null);
const users = ref<User[]>([]);
const publicUsers = ref<PublicUser[]>([]);
const publicUser = ref<PublicUser>();
const username = computed(() => route.params.profile.toString().replace("@", ""));
const savedArticles = ref<Lists[]>([]);
const savedPost = ref<SavedPosts[]>([]);
const blog_db = ref<BlogData[]>([]);
const isLoading = ref<boolean>(true);
const userNotFound = ref<boolean>(false);

const findPostAuthor = (post_id: string) => {
  return users.value.find((u) => u.id === post_id);
};

watchEffect(() => {
  return (publicUser.value = publicUsers.value.find(
    (u) => u.id === user.value?.id
  ));
});

onMounted(async () => {
  try {
    const data = await getAllUser();
    if (data) {
      users.value = data;
      const foundUser = data.find(
        (u) => u.user_metadata.username.toLowerCase() === username.value.toLowerCase()
      );
      
      if (foundUser) {
        user.value = foundUser;
        const [lists, savedPosts, recentPosts, publicUser] = await Promise.all([
          getLists(foundUser.id),
          getSavedPost(),
          getRecentPost(),
          getPublicUser(),
        ]);
        
        savedArticles.value = lists || [];
        savedPost.value = savedPosts || [];
        blog_db.value = recentPosts || [];
        publicUsers.value = publicUser || [];
      } else {
        userNotFound.value = true;
      }
    }
  } catch (error: any) {
    console.error("Error fetching data:", error);
    userNotFound.value = true;
  } finally {
    isLoading.value = false;
  }

  supabase
    .channel("blog_posts")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "blog_posts" },
      (payload) => {
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          if (payload.new) {
            const updatedPost = payload.new as BlogData;
            const existingIndex = blog_db.value.findIndex(
              (data) => data.id === updatedPost.id
            );

            if (existingIndex > -1) {
              blog_db.value[existingIndex] = updatedPost;
            } else {
              blog_db.value = [...blog_db.value, updatedPost];
            }
          }
        } else if (payload.eventType === "DELETE") {
          if (payload.old) {
            blog_db.value = blog_db.value.filter(
              (data) => data.id !== payload.old.id
            );
          }
        }
      }
    )
    .subscribe();
});

onUnmounted(() => {
  supabase.channel("blog_posts").unsubscribe();
});

useSeoMeta({
  title: user.value?.user_metadata?.username ? `${user.value?.user_metadata.username}'s Profile` : "User not found",
  ogTitle: user.value?.user_metadata?.username ? `${user.value?.user_metadata.username}'s Profile` : "User not found",
  ogDescription:
    user.value?.user_metadata.description ||
    "Discover the world of Chinese or Korean dramas with us! Dive into captivating stories, explore a community of fans, and find everything you need to start your dramas journey.",
  ogImage: user.value?.user_metadata?.profile_url || "/default-pf.jpg",
  ogUrl: `${import.meta.env.VITE_BASE_URL}/@${user.value?.user_metadata.username}`,
  description:
    user.value?.user_metadata.description ||
    "Discover the world of Chinese or Korean dramas with us! Dive into captivating stories, explore a community of fans, and find everything you need to start your dramas journey.",
  twitterTitle: user.value?.user_metadata?.username ? `${user.value?.user_metadata.username}'s Profile` : "User not found",
  twitterDescription:
    user.value?.user_metadata.description ||
    "Discover the world of Chinese or Korean dramas with us! Dive into captivating stories, explore a community of fans, and find everything you need to start your dramas journey.",
  twitterImage:
    user.value?.user_metadata?.profile_url || "/default-pf.jpg",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div v-if="isLoading">
    <ProfileLoading />
  </div>
  <div v-else-if="!userNotFound" class="min-h-screen">
    <!-- Profile Header -->
    <header class="bg-white dark:bg-foreground shadow">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center space-x-6">
          <NuxtImg
            format="webp"
            loading="lazy"
            :src="user?.user_metadata.profile_url"
            alt="Profile picture"
            class="h-24 w-24 rounded-full object-cover"
          />
          <div>
            <div class="flex items-center">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ user?.user_metadata.username }}
              </h1>
              <NuxtLink
                v-show="user?.id === currentUser?.id"
                to="/settings"
                class="text-black dark:text-white pl-2 pt-1 hover:text-orange-400"
              >
                <UserPen />
              </NuxtLink>
            </div>
            <div
              class="flex items-center mt-2 text-sm text-gray-500 dark:text-muted"
            >
              <UserIcon class="h-4 w-4 mr-1" />
              <span>Joined {{ formattedDate(user?.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Tab Navigation -->
    <Tabs class="w-full" default-value="home">
      <nav
        class="bg-muted dark:bg-gray-800 shadow-sm border border-muted dark:border-gray-800"
      >
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex space-x-8">
            <ProfileNavigation :username="username" />
          </div>
        </div>
      </nav>

      <!-- Content Area -->
      <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Home Tab (Post of User)-->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-muted mb-6">
            Recent Posts
          </h2>
          <HomeTab
            v-if="blog_db.length > 0"
            :blog_db="blog_db"
            :user="user"
            :findPostAuthor="findPostAuthor"
            :currentUser="currentUser"
          />
          <div v-else class="text-black dark:text-muted">
            <div v-if="user?.id === currentUser?.id">
              You don't have any post yet!
              <NuxtLink
                to="/new_blog"
                class="border-b border-orange-400 pb-2 hover:text-orange-400 transform duration-300 hover:border-opacity-60"
              >
                Create new post here!</NuxtLink
              >
            </div>
            <div v-else>This user doesn't has any post yet!</div>
          </div>
        </div>
      </main>
    </Tabs>
  </div>
  <div
    v-else
    class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 transition-colors duration-500"
  >
    <div class="max-w-md w-full">
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-500"
      >
        <div class="p-8">
          <div class="flex items-center justify-center w-20 h-20 mx-auto mb-6">
            <div class="relative">
              <div
                class="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"
              ></div>
              <div
                class="relative bg-white dark:bg-gray-700 rounded-full p-4 shadow-lg"
              >
                <UserX class="w-12 h-12 text-blue-500 dark:text-blue-400" />
              </div>
            </div>
          </div>
          <h1
            class="text-3xl font-extrabold text-center text-gray-800 dark:text-white mb-2"
          >
            User Not Found
          </h1>
          <p class="text-center text-gray-600 dark:text-gray-300 mb-8">
            We couldn't find a user with the username "{{ username }}" in our
            system.
          </p>
          <div class="space-y-4">
            <NuxtLink
              to="/"
              class="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-300 ease-in-out flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              <ArrowLeft class="w-5 h-5" />
              <span>Go Back Home</span>
            </NuxtLink>
          </div>
        </div>
      </div>
      <div class="mt-8 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Need help?
          <a href="/contact" class="text-blue-500 hover:underline"
            >Contact Support</a
          >
        </p>
      </div>
    </div>
  </div>
</template>