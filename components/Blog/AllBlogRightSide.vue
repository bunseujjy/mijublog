<script setup lang="ts">
import { type FollowInfo, type BlogData } from '~/lib/type';
import type { User } from '@supabase/supabase-js'
import { getAuthorDetails } from '~/lib/getAuthorDetails';
import { formattedDate } from '~/lib/formattedDate';
import { followUser } from '~/server/user/followerUser';
import { getUserInfo } from '~/server/user/getUserInfo';
import { unfollowUser } from '~/server/user/unfollowUser';

const props = defineProps<{
    users: User[];
    currentUser: User | null;
    blog_db: BlogData[];
}>()

const { all_lists, getAllLists, saved_posts } = useLists()
const { all_post, getAllPost } = useBlogPosts()
const { public_user } = useAuth()
const followInfo = ref<FollowInfo[]>([])
const isLoading = ref(false)

const findBlogPost = (post_id: string) => {
    return all_post.value.filter((data) => data.id === post_id)
}

const hasSavedBlogPosts = computed(() => {
    // Check if there are any lists and if any list has saved posts
    return all_lists.value.some(list => 
        saved_posts.value.some(post => post.list_id === list.id)
    );
});

const isFollowing = (userId: string) => {
  return followInfo.value.some(data => 
    data.follower_id === props.currentUser?.id && 
    data.author_id === userId
  )
}

const handleFollow = async (userId: string) => {
    try {
        if (isFollowing(userId)) {
            await unfollowUser(userId)
        } else {
            await followUser(props.currentUser?.id ?? '', userId)
        }
    } catch (error) {
        console.error('Error following user:', error)
    } finally {
        isLoading.value = false
    }
}

onMounted( async () => {
    await Promise.all([getAllLists(), getAllPost()]) 
    followInfo.value = await getUserInfo() as FollowInfo[]
    console.log(followInfo.value)
})
</script>

<template>
    <div class="w-full h-full text-black dark:text-white px-8">
        <!-- Empty State for Lists -->
        <div v-if="!hasSavedBlogPosts" class="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h1 class="text-lg md:text-xl font-bold mb-2">Your Reading Lists</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">
                You haven't saved any posts to your lists yet. Start saving interesting articles to read later!
            </p>
        </div>

        <!-- Lists with Content -->
        <div class="block" v-else>
            <h1 class="text-lg md:text-xl font-bold">Recent Lists</h1>
            <div
                v-for="list in all_lists.sort((a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime()).slice(0, 4)"
                :key="list.id"
            >
                <!-- Filter posts by current list -->
                <div
                    class="mt-3"
                    v-for="post in saved_posts
                        .filter((data) => data.list_id === list.id)
                        .slice(0, 4)
                        .sort((a, b) => new Date(b.saved_at ?? '').getTime() - new Date(a.saved_at ?? '').getTime())"
                    :key="post.id"
                >
                    <!-- Find and display blogs -->
                    <div
                        class="mb-2"
                        v-for="blog in findBlogPost(post.post_id)"
                        :key="blog.id"
                    >
                        <div class="flex items-center">
                            <NuxtImg format="webp" loading="lazy"
                                :src="getAuthorDetails(users, post.user_id)?.user_metadata?.profile_url"
                                alt="Profile Img"
                                quality="80"
                                class="w-8 h-8 object-cover rounded-full"
                            />
                            <h1 class="text-xs pl-2">
                                {{ getAuthorDetails(users, post.user_id)?.user_metadata?.username }}
                            </h1>
                        </div>
                        <div class="space-y-1 mt-2">
                            <h1 class="text-sm font-bold">{{ blog.title }}</h1>
                            <p class="text-xs text-gray-300">
                                {{ blog.subtitle.length > 70 ? blog.subtitle.slice(0, 70) + '...' : blog.subtitle }}
                            </p>
                            <p class="text-xs">{{ formattedDate(blog.publish_date ?? '') }}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Render single link for current list -->
                <div class="mt-2 text-right">
                    <NuxtLink
                        v-for="post in saved_posts
                            .filter((data) => data.list_id === list.id)
                            .slice(0, 1)"
                        :key="post.id"
                        :to="`/@${getAuthorDetails(users, post.user_id)?.user_metadata?.username}/lists/${all_lists.find((data) => data.id === post.list_id)?.slug}`"
                        class="text-blue-500"
                    >
                        See the full list
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- Who to Follow Section -->
        <div class="mt-8">
            <h1 class="text-lg md:text-xl font-bold mb-4">Who to follow 😎</h1>
            <!-- Empty State for Users to Follow -->
            <div v-if="!public_user.filter((data) => data.user_id !== currentUser?.id).length" 
                class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    No suggestions available at the moment. Check back later for new people to follow!
                </p>
            </div>
            <!-- Users List -->
            <div class="space-y-4" v-else>
                <div v-for="user in public_user.filter((data) => data.user_id !== currentUser?.id)
                    .sort((a,b) => b.following_length - a.following_length)" 
                    :key="user.id"
                    class="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                    <div class="flex items-start">
                        <NuxtImg format="webp" loading="lazy" 
                            :src="user.profile_url" 
                            alt="User's Profile" 
                            class="size-10 object-cover rounded-full" 
                            quality="80" 
                            :placeholder="15"
                        />
                        <div class="flex-1 pl-3">
                            <p class="font-medium text-sm">{{ user.username }}</p>
                            <p class="text-muted opacity-80 text-xs mt-1">{{ user.description }}</p>
                            <Button 
                                :disabled="isLoading"
                                class="!bg-transparent border border-muted hover:!bg-muted hover:text-black transform duration-300 rounded-md mt-2"
                                @click="handleFollow(user.user_id)"
                            >
                                {{ isFollowing(user.user_id) ? 'Following' : 'Follow' }}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>