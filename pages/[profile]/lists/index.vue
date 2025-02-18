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
    const { user: currentUser } = await  useAuth()
    const client = useSupabaseClient()
    const user = ref<User | null>(null);
    const users = ref<User[]>([]);
    const publicUsers = ref<PublicUser[]>([])
    const publicUser = ref<PublicUser>()
    const username = computed(() => route.params.profile.toString());
    const savedArticles = ref<Lists[]>([]);
    const savedPost = ref<SavedPosts[]>([]);
    const blog_db = ref<BlogData[]>([]);
    const isLoading = ref<boolean>(true)

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
        } finally {
            isLoading.value = false;
        }

        client
            .channel('user_lists')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_lists'
                },
                (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload

                    try {
                        switch (eventType) {
                            case 'INSERT':
                                savedArticles.value = [...savedArticles.value, newRecord as Lists]
                                break
                            case 'UPDATE':
                                savedArticles.value = savedArticles.value.map(article => {
                                    if (article.id === newRecord.id) {
                                        // Ensure we update all fields including status
                                        return { ...article, ...newRecord }
                                    }
                                    return article
                                })
                                break
                            case 'DELETE':
                                savedArticles.value = savedArticles.value.filter(article =>
                                    article.id !== oldRecord.id
                                )
                                break
                        }
                    } catch (error) {
                        console.error('Error processing realtime update:', error)
                    }
                }
            )
            .subscribe()
    });

    onUnmounted(() => {
        client.channel('user_lists').unsubscribe()
    })
    useSeoMeta({
        title: `${currentUser.value?.user_metadata.username}'s Lists`,
        ogTitle: `${currentUser.value?.user_metadata.username}'s Lists`,
        ogDescription:
            currentUser.value?.user_metadata.description ||
            "Discover the world of Chinese or Korean dramas with us! Dive into captivating stories, explore a community of fans, and find everything you need to start your dramas journey.",
        ogImage: currentUser.value?.user_metadata?.profile_url || "/default-pf.jpg",
        ogUrl: `${import.meta.env.VITE_BASE_URL}/@${currentUser.value?.user_metadata.username}/lists`,
        description:
            currentUser.value?.user_metadata.description ||
            "Discover the world of Chinese or Korean dramas with us! Dive into captivating stories, explore a community of fans, and find everything you need to start your dramas journey.",
        twitterTitle: `${currentUser.value?.user_metadata.username}'s Lists`,
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

        <Tabs class="w-full" default-value="lists">
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
                <TabsContent value="lists">

                    <!-- Lists Tab (Saved List) -->
                    <div v-if="user?.id === currentUser?.id" class="px-4">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-muted mb-6">
                            Saved Articles
                        </h2>
                        <ListTab v-if="savedArticles.length > 0" :blog_db="blog_db" :user="user"
                            :findPostAuthor="findPostAuthor" :savedArticles="savedArticles" :savedPost="savedPost" />
                        <div v-else class="text-black dark:text-muted">
                            <div>
                                You don't have any saved list yet! <NuxtLink :to="'/'"
                                    class="border-b border-orange-400 pb-2 hover:text-orange-400 transform duration-300 hover:border-opacity-60">
                                    Go and save some post to your list</NuxtLink>
                            </div>
                        </div>
                    </div>
                    <div v-else>
                        <div v-if="savedArticles.length > 0" class="text-black dark:text-muted px-4">
                            <div>
                                This user does not have any saved list yet.
                            </div>
                        </div>
                    </div>
                </TabsContent>

            </main>
        </Tabs>
    </div>
    <div v-else>
        <ProfileListLoading :savedArticles="savedArticles" />
    </div>
</template>
