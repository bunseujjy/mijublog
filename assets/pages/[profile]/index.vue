<script setup lang="ts">
  import { ref } from "vue";
  import { UserIcon, ClockIcon, UserPen } from "lucide-vue-next";
  import type { User } from "@supabase/supabase-js";
  import { formattedDate } from "~/lib/formattedDate";
  import { getLists } from "~/server/list/getLists";
  import { getSavedPost } from "~/server/post/getSavedPost";
  import { getRecentPost } from "~/server/post/getRecentBlog";
  import type { BlogData, Lists, PublicUser, SavedPosts } from "~/lib/type";
  import { getPublicUser } from "~/server/user/getPublicUser";

  const route = useRoute();
  const activeTab = ref("home");
  const {user: currentUser} = useAuth()
  const user = ref<User | null>(null);
  const users = ref<User[]>([]);
  const publicUsers = ref<PublicUser[]>([])
  const publicUser = ref<PublicUser>()
  const username = computed(() => route.params.profile.toString());
  const savedArticles = ref<Lists[]>([]);
  const savedPost = ref<SavedPosts[]>([]);
  const blog_db = ref<BlogData[]>([]);

  const findPostAuthor = (post_id: string) => {
    return users.value.find((u) => u.id === post_id);
  };

  watchEffect(() => {
    return publicUser.value = publicUsers.value.find((u) => u.id === user.value?.id)
  })

  onMounted(async () => {
    try {
      const data = await getAllUser();
      if (typeof username.value === "string") {
        user.value = data?.find(
          (u) => u.user_metadata.username === username.value.replace("@", "")
        ) as User;
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error);
    }
    try {
      const [lists, savedPosts, recentPosts, allUsers, publicUser] = await Promise.all([
        getLists(user.value?.id as string),
        getSavedPost(),
        getRecentPost(),
        getAllUser(),
        getPublicUser(),
      ]);
      savedArticles.value = lists || [];
      savedPost.value = savedPosts || [];
      blog_db.value = recentPosts || [];
      users.value = allUsers || [];
      publicUsers.value = publicUser || [];
    } catch (error: any) {
      console.error("Error fetching data:", error);
    }
  });
</script>

<template>
  <div class="min-h-screen">
    <!-- Profile Header -->
    <header class="bg-white dark:bg-foreground shadow">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center space-x-6">
          <NuxtImg :src="user?.user_metadata.profile_url" alt="Profile picture"
            class="h-24 w-24 rounded-full object-cover" />
          <div>
            <div class="flex items-center">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ user?.user_metadata.username }}
              </h1>
              <NuxtLink v-show="user?.id === currentUser?.id" to="/settings"
                class="text-black dark:text-white pl-2 pt-1 hover:text-orange-400">
                <UserPen />
              </NuxtLink>
            </div>
            <div class="flex items-center mt-2 text-sm text-gray-500 dark:text-muted">
              <UserIcon class="h-4 w-4 mr-1" />
              <span>Joined {{ formattedDate(user?.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Tab Navigation -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex space-x-8">
          <button @click="activeTab = 'home'" :class="[
            'py-4 px-1 border-b-2 font-medium text-sm focus:outline-none',
            activeTab === 'home'
              ? 'border-black dark:border-muted text-gray-900 dark:text-muted'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ]">
            Home
          </button>
          <button v-show="user?.id === currentUser?.id" @click="activeTab = 'lists'" :class="[
            'py-4 px-1 border-b-2 font-medium text-sm focus:outline-none',
            activeTab === 'lists'
              ? 'border-black dark:border-muted text-gray-900 dark:text-muted'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ]">
            Lists
          </button>
          <button @click="activeTab = 'about'" :class="[
            'py-4 px-1 border-b-2 font-medium text-sm focus:outline-none',
            activeTab === 'about'
              ? 'border-black dark:border-muted text-gray-900 dark:text-muted'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ]">
            About
          </button>
        </div>
      </div>
    </nav>

    <!-- Content Area -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Home Tag (Post of User)-->
      <div v-if="activeTab === 'home'">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-muted mb-6">
          Recent Posts
        </h2>
        <HomeTab v-if="blog_db.length > 0" :blog_db="blog_db" :user="user" :findPostAuthor="findPostAuthor"/>
        <div v-else class="text-black dark:text-muted">
          <div v-if="user?.id === currentUser?.id">
            You don't have any post yet! <NuxtLink :to="'/new_blog'"
              class="border-b border-orange-400 pb-2 hover:text-orange-400 transform duration-300 hover:border-opacity-60">
              Create new post here!</NuxtLink>
          </div>
          <div v-else>This user doesn't has any post yet!</div>
        </div>
      </div>
      <!-- Lists Tab (Saved List) -->
      <div v-if="activeTab === 'lists' && user?.id === currentUser?.id">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-muted mb-6">
          Saved Articles
        </h2>
        <ListTab  v-if="savedArticles.length > 0" :blog_db="blog_db" :user="user" :findPostAuthor="findPostAuthor" :savedArticles="savedArticles" :savedPost="savedPost"/>
        <div v-else class="text-black dark:text-muted">
          <div>
            You don't have any saved list yet! <NuxtLink :to="'/'"
              class="border-b border-orange-400 pb-2 hover:text-orange-400 transform duration-300 hover:border-opacity-60">
              Go and save some post to your list</NuxtLink>
          </div>
        </div>
      </div>

      <!-- About Tab (Bio) -->
      <div v-if="activeTab === 'about'" class="shadow rounded-lg overflow-hidden">
        <AboutMeTab :user="user" :currentUser="currentUser" :publicUser="publicUser" />
      </div>
    </main>
  </div>
</template>
