<script setup lang="ts">
    import { UserIcon, UserPen } from "lucide-vue-next";
    import type { User } from "@supabase/supabase-js";
    import { formattedDate } from "~/lib/formattedDate";
    import { getLists } from "~/server/list/getLists";
    import { getSavedPost } from "~/server/post/getSavedPost";
    import { getRecentPost } from "~/server/post/getRecentBlog";
    import type { BlogData, Lists, PublicUser, SavedPosts } from "~/lib/type";
    import { getPublicUser } from "~/server/user/getPublicUser";

    const route = useRoute();
    const { user: currentUser } =useAuth();
    const user = ref<User | null>(null);
    const users = ref<User[]>([]);
    const publicUsers = ref<PublicUser[]>([])
    const publicUser = ref<PublicUser>()
    const username = computed(() => route.params.profile.toString());
    const savedArticles = ref<Lists[]>([]);
    const savedPost = ref<SavedPosts[]>([]);
    const blog_db = ref<BlogData[]>([]);
    const isLoading = ref<boolean>(true)

    watchEffect(() => {
        return publicUser.value = publicUsers.value.find((u) => u.user_id === user.value?.id)
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
        } finally {
            isLoading.value = false;
        }
    });
    
    useSeoMeta({
        title: `${currentUser.value?.user_metadata.username}'s About`,
        ogTitle: `${currentUser.value?.user_metadata.username}'s About`,
        ogDescription:
            currentUser.value?.user_metadata.description ||
            "Discover the world of Chinese or Korean dramas with us! Dive into captivating stories, explore a community of fans, and find everything you need to start your dramas journey.",
        ogImage: currentUser.value?.user_metadata?.profile_url || "/default-pf.jpg",
        ogUrl: `${import.meta.env.VITE_BASE_URL}/@${currentUser.value?.user_metadata.username}/about`,
        description:
            currentUser.value?.user_metadata.description ||
            "Discover the world of Chinese or Korean dramas with us! Dive into captivating stories, explore a community of fans, and find everything you need to start your dramas journey.",
        twitterTitle: `${currentUser.value?.user_metadata.username}'s About`,
        twitterDescription:
            currentUser.value?.user_metadata.description ||
            "Discover the world of Chinese or Korean dramas with us! Dive into captivating stories, explore a community of fans, and find everything you need to start your dramas journey.",
        twitterImage:
            currentUser.value?.user_metadata?.profile_url || "/default-pf.jpg",
        twitterCard: "summary_large_image",
    });
</script>

<template>
    <div v-if="!isLoading" class="min-h-screen">
        <!-- Profile Header -->
        <header class="bg-white dark:bg-foreground shadow">
            <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="flex items-center space-x-6">
                    <NuxtImg format="webp" loading="lazy" :src="user?.user_metadata.profile_url" alt="Profile picture"
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

        <Tabs class="w-full" default-value="about">
            <!-- Tab Navigation -->
      <nav class="bg-muted dark:bg-gray-800 shadow-sm border border-muted dark:border-gray-800">
                <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex space-x-8">
                        <ProfileNavigation :username="username" />
                    </div>
                </div>
            </nav>

            <!-- Content Area -->
            <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <TabsContent value="about">
                    <AboutMeTab :user="user" :currentUser="currentUser" :publicUser="publicUser" />
                </TabsContent>

            </main>
        </Tabs>
    </div>
    <div v-else>
        <ProfileAboutLoading />
    </div>
</template>
