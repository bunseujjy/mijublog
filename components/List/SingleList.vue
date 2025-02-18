<script setup lang="ts">
    import { NotebookPen, GripVertical, HandHeart, Lock, LockOpen, MessageCircleDashed, MessageCircleHeart, Share, Facebook, Instagram, Link2 } from 'lucide-vue-next';
    import { formattedDate } from '~/lib/formattedDate';
    import { getAuthorDetails } from '~/lib/getAuthorDetails';
    import type { BlogData, Lists, SavedPosts } from '~/lib/type';
    import type { User } from '@supabase/supabase-js'
    import { useInfiniteScroll } from '@vueuse/core';
    import { likePost } from '~/server/post/likePost';
    import { useToast } from '../ui/toast';

    const props = defineProps<{
        slug: string | string[];
        users: User[];
        user: User | null;
        list_db: Lists | null;
        getListsBySlug: (slug: string | string[]) => Promise<void>;
        linkToCopy: string;
        saved_posts: SavedPosts[];
        loadMoreListItems: () => void;
        isLoading: boolean;
        isScrolling: boolean;
    }>()
    const client = useSupabaseClient()
    const route = useRoute();
    const router = useRouter();
    const loadMoreTrigger = ref<HTMLElement | null>(null)
    const isError = ref(false);
    const isLiking = ref(false)
    const isPageLoading = ref(true)
    const isOpen = ref(false)
    const { all_post, getAllPost } = useBlogPosts()
    const username = computed(() => route.params.profile.toString());
    const owner = ref<User | null>(null);

    const retryFetch = async () => {
        isError.value = false
        try {
            await getAllUser()
        } catch (err) {
            console.error('Failed to fetch data:', err)
            isError.value = true
        }
    }

    const findBlogPost = (post_id: string) => {
        return all_post.value.filter((data) => data.id === post_id)
    }

    const handleLikePost = async (blog_id: string) => {
        isLiking.value = true;
        try {
            await likePost(1, blog_id, props.user?.id ?? "");
        } finally {
            isLiking.value = false;
        }
    };

    // Setup intersection observer for infinite scroll
    useInfiniteScroll(
        loadMoreTrigger,
        () => {
            if (!props.isScrolling) {
                props.loadMoreListItems();
            }
        },
        { distance: 10 }
    );
    onMounted(async () => {
        try {
            const data = await getAllUser();
            if (typeof username.value === "string") {
                owner.value = data?.find(
                    (u) => u.user_metadata.username === username.value.replace("@", "")
                ) as User;
            }
            try {
            } catch (error: any) {
                console.error("Error fetching user data:", error);
            }
            await Promise.all([
                props.getListsBySlug(props.slug),
                getAllPost()
            ])
        } catch (error: any) {
            console.error(error.message)
        } finally {
            isPageLoading.value = false;
        }
        // Listen for updates on the `blog_posts` table
        client
            .channel("blog_posts")
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'blog_posts'
                },
                (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload
                    try {
                        switch (eventType) {
                            case 'INSERT':
                                console.log('Inserting new post:', newRecord)
                                all_post.value = [newRecord as BlogData, ...all_post.value]
                                break
                            case 'UPDATE':
                                all_post.value = all_post.value.map((post) =>
                                    post.id === newRecord.id ? { ...post, ...newRecord } : post
                                )
                                break
                            case 'DELETE':
                                all_post.value = all_post.value.filter((post) => post.id !== oldRecord.id)
                                break
                        }
                    } catch (error) {
                        console.error('Error processing realtime update:', error)
                    }
                }
            )
            .subscribe((status) => {
                console.log('Realtime subscription status:', status)
            })

    })

    onUnmounted(() => {
        client.channel("blog_posts").unsubscribe();
    });

    const cancelRemoving = () => {
        isOpen.value = false;

        // Remove the `success` query parameter
        const updatedQuery = { ...route.query };
        delete updatedQuery.success;

        router.replace({ query: updatedQuery });
    };

    watchEffect(() => {
        if (route.query.success === 'true') {
            isOpen.value = true;
        }
    })
</script>

<template>
    <div class="mt-14 text-black dark:text-white">
        <Meta property="og:title" :content="list_db?.name" />
        <Meta property="og:description" :content="list_db?.description" />
        <Meta property="og:image" content="/post_placeholder.png" />
        <Meta property="og:url" :content="linkToCopy" />

        <Head>
            <Title>{{ list_db?.name }}</Title>
            <Meta name="description" :content="list_db?.description" />
        </Head>
        <div v-if="isPageLoading">
            <SingleListLoading v-if="!isOpen" />
            <RemovingListLoading v-else />
        </div>
        <div v-else>
            <div class="flex items-start">
                <NuxtImg format="webp" loading="lazy" :src="getAuthorDetails(users, list_db?.user_id ?? '')?.user_metadata?.profile_url"
                    alt="Profile Img" quality="80" class="w-14 h-14 object-cover rounded-full" />
                <div class="flex flex-col items-start pl-2.5">
                    <h1>{{ getAuthorDetails(users, list_db?.user_id ?? '')?.user_metadata?.username }}</h1>
                    <h2>{{ formattedDate(list_db?.created_at ?? '') }} -
                        <span>{{ saved_posts.filter((data) => data.list_id === list_db?.id).length }} blogs</span>
                        <span class="inline-block align-middle pl-2" v-if="list_db?.status !== 'public'">
                            <Lock :size="14" />
                        </span>
                        <span v-else class="inline-block align-middle pl-2">
                            <LockOpen :size="14" />
                        </span>
                    </h2>
                </div>
            </div>
            <div v-if="!isOpen">
                <div class="w-full h-full mt-10">
                    <h1 class="text-2xl font-bold mb-4">{{ list_db?.name }}</h1>
                    <div class="border-y border-y-muted dark:border-y-gray-600 my-2">
                        <ClientOnly>
                            <TooltipProvider>
                                <div class="flex items-center justify-between py-1 space-x-3">
                                    <div class="flex items-center space-x-3">
                                        <div>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button :disabled="list_db?.user_id === user?.id"
                                                        :class="{ 'opacity-60 cursor-not-allowed': list_db?.user_id === user?.id }">
                                                        <MessageCircleHeart />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div>
                                                        <span v-if="list_db?.user_id !== user?.id">Like</span>
                                                        <span v-else>You cannot like your own list.</span>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <div>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        :class="{ 'opacity-60 cursor-not-allowed': list_db?.status === 'private' }">
                                                        <MessageCircleDashed />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div>
                                                        <span v-if="list_db?.status === 'public'">Comment</span>
                                                        <span v-else>Comment are disabled for private list.</span>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <div v-show="list_db?.status === 'public'">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger>
                                                                <Button class="!bg-transparent">
                                                                    <Share />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuItem>
                                                                    <SocialShare network="facebook" :styled="true"
                                                                        :url="linkToCopy">
                                                                        <template #label>
                                                                            <span class="text-sm pl-2">Share on Facebook</span>
                                                                        </template>
                                                                    </SocialShare>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <div class="flex items-center">
                                                                        <SocialShare network="twitter" :styled="true"
                                                                            :url="linkToCopy"
                                                                            :hashtags="list_db?.name?.replace(/\s+/g, '')?.toString()">
                                                                            <template #label>
                                                                                <span class="text-sm pl-2">Share on
                                                                                    Twitter</span>
                                                                            </template>
                                                                        </SocialShare>
                                                                    </div>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <div class="flex items-center">
                                                                        <SocialShare network="reddit" :styled="true"
                                                                            :url="linkToCopy">
                                                                            <template #label>
                                                                                <span class="text-sm pl-2">Share on
                                                                                    Reddit</span>
                                                                            </template>
                                                                        </SocialShare>
                                                                    </div>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <div class="flex items-center">
                                                                        <Link2 />
                                                                        <span class="text-sm pl-4">Copy Link</span>
                                                                    </div>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div>Share List</div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <div>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div>
                                                        <EditingList :article="list_db" :user="owner" url="success=true"
                                                            :linkToCopy="linkToCopy" />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div>More</div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                            </TooltipProvider>
                        </ClientOnly>
                    </div>
                </div>
                <!-- Rest of the template remains unchanged -->
                <div class="transition-colors duration-300" ref="loadMoreTrigger">
                    <!-- Loading State -->
                    <div v-if="isLoading && !saved_posts.length" class="flex justify-center items-center min-h-[200px]">
                        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>

                    <!-- Error State -->
                    <div v-if="isError" class="text-red-500 text-center py-8">
                        <p class="text-lg">Failed to load data. Please try again later.</p>
                        <button @click="retryFetch"
                            class="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
                            Retry
                        </button>
                    </div>

                    <!-- Blog Content -->
                    <div v-if="!isLoading && !isError" class="w-full flex flex-col lg:flex-row">
                        <div class="w-full flex flex-col gap-10 mt-5">
                            <TransitionGroup name="list" tag="div">
                                <div v-for="list in saved_posts.filter((data) => data.list_id === list_db?.id)"
                                    :key="list.id"
                                    class="border-b border-b-muted pb-5 transition-all duration-300 ease-in-out mt-5">
                                    <div class="flex flex-col md:flex-row items-start md:items-center justify-between"
                                        v-for="blog in findBlogPost(list.post_id)" :key="blog.id">
                                        <div class="text-black dark:text-white flex-grow space-y-2">
                                            <div class="flex items-center">
                                                <NuxtImg format="webp" loading="lazy" :src="getAuthorDetails(users, blog.author_id)?.user_metadata
                                                    ?.profile_url || '/post_placeholder.png'
                                                    " :alt="'blog ' + blog.id"
                                                    class="size-[35px] bg-center object-cover rounded-full mt-4 md:mt-0"
                                                    :placeholder="15" sizes="100vw sm:50vw md:35px"/>
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

                                            <div class="flex items-center justify-between w-full mt-auto">
                                                <div
                                                    class="flex items-center text-black dark:text-white space-x-2 mt-2 mb-3 md:mt-0 md:mb-0">
                                                    <NotebookPen class="text-yellow-500" :size="20" />
                                                    <p @click="handleLikePost(blog?.id)" :class="[
                                                        'flex items-center cursor-pointer',
                                                        { 'cursor-not-allowed': isLiking },
                                                    ]">
                                                        <HandHeart :size="20" />
                                                        <span class="pl-2">{{ blog?.likes_count }}</span>
                                                    </p>

                                                    <p class="flex items-center">
                                                        <MessageCircleDashed :size="20" />
                                                        <span class="pl-2">{{ blog?.comments_count }}</span>
                                                    </p>
                                                </div>
                                                <div class="flex space-x-2 md:mr-2 mt-2 mb-3 md:mt-0 md:mb-0">
                                                    <TooltipProvider>
                                                        <div>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div>
                                                                        <SavePostModal :currentUser="user" :blog_db="blog" />
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <div>Save</div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                        <div>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div>
                                                                        <PostOptionDropdown :currentUser="user"
                                                                            :blog_db="blog" />
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <div>More</div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                    </TooltipProvider>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="w-full md:w-[250px] aspect-[5/3] flex-shrink-0">
                                            <NuxtImg format="webp" loading="lazy" :src="blog.featured_image_url || '/post_placeholder.png'"
                                                :alt="'blog ' + blog.id" class="w-full h-full object-cover"
                                                :placeholder="15" sizes="(min-width: 768px) 250px, 100vw" />
                                        </div>
                                    </div>
                                </div>
                            </TransitionGroup>
                            <!-- Loading More Indicator - Fixed position at bottom -->
                            <div v-if="isLoading && saved_posts.length"
                                class="sticky bottom-0 text-center py-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                                <div
                                    class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto">
                                </div>
                            </div>

                            <!-- Intersection Observer Target -->
                            <div v-if="isScrolling" class="text-center py-4">
                                <div
                                    class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                <RemovingLists :list_db="list_db" :saved_posts="saved_posts" :all_post="all_post"
                    @cancelRemoving="cancelRemoving" :owner="owner" />
            </div>
            <template v-if="saved_posts.filter((data) => data.list_id === list_db?.id).length === 0">
                <div class="text-black dark:text-white border-t border-t-muted pt-5">
                    This list is empty.
                    <NuxtLink to="/post" class="text-red-400">Click here</NuxtLink> to add blogs to this list.
                </div>
            </template>
            <Comment 
                :blog_db="null"
                :list_db="list_db"
                :currentUser="props.user"
                :users="props.users"
                type="list"
            />
        </div>
    </div>
</template>

<style>
.social-share-button {
    width: auto;
    font-size: '4px';
    gap: 2px;
    background-color: transparent;
    --color-brand: transparent;
    padding: 1px;
}
</style>