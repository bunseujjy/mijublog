<script setup lang="ts">
  import { ref } from "vue";
  import { UserIcon, ClockIcon, UserPen } from "lucide-vue-next";
  import type { User } from "@supabase/supabase-js";
  import { formattedDate } from "~/lib/formattedDate";
  import { getLists } from "~/server/list/getLists";
  import { getSavedPost } from "~/server/post/getSavedPost";
  import { getRecentPost } from "~/server/post/getRecentBlog";
  import type { BlogData } from "~/lib/type";

  const route = useRoute();
  const activeTab = ref("home");
  const currentUser = ref();
  const user = ref<User>();
  const users = ref<User[]>([]);
  const username = computed(() => route.params.profile.toString());
  const savedArticles = ref<any[]>([]);
  const savedPost = ref<any[]>([]);
  const blog_db = ref<BlogData[]>([]);
  const isEditing = ref(false)
  const description = ref('')

  const startEditing = () => {
    isEditing.value = true
    description.value = user?.value?.user_metadata?.desc || user?.value?.user_metadata?.description || ''
  }

  const cancelEditing = () => {
    isEditing.value = false
    description.value = ''
  }

  const findPostAuthor = (post_id: string) => {
    return users.value.find((u) => u.id === post_id);
  };

  onMounted(async () => {
    await getCurrentUser(currentUser);
    try {
      const data = await getAllUser();
      if (typeof username.value === "string") {
        user.value = data?.find(
          (u) => u.user_metadata.username === username.value.replace("@", "")
        );
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error);
    }

    try {
      const [lists, savedPosts, recentPosts, allUsers] = await Promise.all([
        getLists(user.value?.id as string),
        getSavedPost(),
        getRecentPost(),
        getAllUser(),
      ]);
      savedArticles.value = lists || [];
      savedPost.value = savedPosts || [];
      blog_db.value = recentPosts || [];
      users.value = allUsers || [];
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
        <ul v-if="blog_db.length > 0" class="space-y-8 w-full">
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
        <ul v-if="savedArticles.length > 0" class="space-y-8">
          <li v-for="article in savedArticles" :key="article.id"
            class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div class="flex items-center justify-between p-6">
              <div class="w-full">
                <div class="flex items-center mb-4">
                  <img :src="user?.user_metadata.profile_url" alt="Author avatar"
                    class="h-10 w-10 rounded-full mr-4 object-cover" />
                  <p class="text-sm font-medium text-gray-900 dark:text-muted">
                    {{ user?.user_metadata.username }}
                  </p>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-muted mb-2">
                  {{ article.name }}
                </h3>
                <p class="text-gray-600 dark:text-muted mb-4">
                  {{ article.description }}
                </p>
              </div>
              <div class="w-[294px] flex">
                <div class="relative flex items-center justify-end">
                  <div v-for="(post, index) in blog_db
                    .filter((p) =>
                      savedPost.find((sp) => sp.post_id === p.id)
                    )
                    .slice(0, 4)" :key="post?.id" :style="{
                        zIndex: blog_db.length - 1 - index,
                        position: 'relative',
                        marginLeft: `${index * -20}px`,
                      }">
                    <NuxtLink :to="`post/@${findPostAuthor(post.author_id)?.user_metadata.username}/${post.id}`">
                      <NuxtImg :src="post.featured_image_url" alt="post_img"
                        class="w-[200px] h-[150px] object-cover rounded" />
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
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
        <div class="p-6">
          <div v-if="user?.user_metadata?.description">

            <div v-show="isEditing">
              <ClientOnly>
                <ProfileEditor :user="user" @cancelEditing="cancelEditing" />
              </ClientOnly>
            </div>
            <div v-show="!isEditing" v-html="user?.user_metadata?.description"
              class="text-gray-600 dark:text-muted mb-4">
            </div>
            <div class="space-x-4 text-end">

              <button v-show="isEditing" @click="cancelEditing" type="button"
                class="text-black dark:text-white border border-gray-300 rounded-full py-2 px-4 hover:bg-gray-100 hover:text-black transition-colors duration-200">
                Cancel
              </button>
              <button @click="startEditing" type="button"
                class="text-black dark:text-white border border-gray-300 rounded-full py-2 px-4 hover:bg-gray-100 hover:text-black transition-colors duration-200">Edit</button>
            </div>
          </div>
          <div v-else>
            <div v-if="!isEditing" class="bg-[#F9F9F9] text-center px-5 py-9 space-y-4">
              <p>Share your love for Asian dramas!</p>
              <p>Here's your chance to tell others about your favorite dramas, actors, and genres. Share your journey
                into the world of Asian entertainment, your reviews of must-watch shows, hidden gems, and even fan
                theories. Personalize your bio with rich text and images to showcase your unique perspective!</p>
              <button @click="startEditing" type="button"
                class="border border-black rounded-full py-2 px-4 hover:bg-gray-100 transition-colors duration-200">
                Get Started
              </button>
            </div>
            <div v-else class="space-y-4">
              <ClientOnly>
                <ProfileEditor :user="user" @cancelEditing="cancelEditing" />
              </ClientOnly>

              <div class="flex justify-end space-x-2">
                <button @click="cancelEditing" type="button"
                  class="text-black dark:text-white border border-gray-300 rounded-full py-2 px-4 hover:bg-gray-100 hover:text-black transition-colors duration-200">
                  Cancel
                </button>
                <button type="button"
                  class="bg-indigo-600 text-white rounded-full py-2 px-4 hover:bg-indigo-700 transition-colors duration-200">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
