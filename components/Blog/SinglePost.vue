<script setup lang="ts">
  import type { BlogData } from "~/lib/type";
  import type { PropType } from "vue";
  import { formatDateToNow } from "~/lib/formattedDate";
  import {
    Bookmark,
    GripVertical,
    HandHeart,
    MessageCircleDashed,
    MessageSquareShare,
  } from "lucide-vue-next";
  import type { User } from "@supabase/supabase-js";
  import { likePost } from "~/server/post/likePost";
  import { useToast } from "vue-toastification";
  import { savePost } from "~/server/post/savePost";

  const props = defineProps({
    blog_db: {
      type: Object as PropType<BlogData>,
      required: true,
    },
    currentUser: {
      type: Object as PropType<User>,
      required: true,
    },
    authorDetails: {
      type: Object as PropType<User>,
      required: true
    },
    users: {
      type: Object as PropType<User[]>,
      required: true
    }
  });
  const route = useRoute()
  const toast = useToast()
  const linkToCopy = computed(() => {
    return `${window.location.origin}${route.path}`;
  });
  const copyLink = async () => {
    await navigator.clipboard.writeText(linkToCopy.value)
    toast.success("Link copied to clipboard")
  }
  const client = useSupabaseClient()

  onMounted(() => {
    client
      .channel('blog_posts')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'blog_posts' },
        (payload) => {
          const { new: newRecord, old: oldRecord } = payload;

          // Check if the updated record matches the current blog post
          if (newRecord.id === props.blog_db.id) {
            // Update the likes_count directly in the local state
            props.blog_db.likes_count = newRecord.likes_count;
          }
        }
      )
      .subscribe();
  });
</script>

<template>
  <div class="mt-14">

    <Head>
      <Title>{{ props.blog_db.slug }}</Title>
      <Meta name="description" :content="props.blog_db.subtitle" />
    </Head>
    <h1 class="text-black dark:text-white text-4xl font-bold">{{ props.blog_db.title }}</h1>
    <p class="text-xl font-semibold text-[#6B6B6B] dark:text-slate-300 mt-2">
      {{ props.blog_db.subtitle }}
    </p>
    <div class="flex items-center mt-5">
      <NuxtImg :src="authorDetails?.user_metadata.profile_url" alt="profile"
        class="size-[50px] rounded-full bg-center object-cover" />
      <div class="flex flex-col pl-2">
        <h1 class="text-black dark:text-white">{{ authorDetails?.user_metadata?.username }}</h1>
        <p class="text-[#6B6B6B] dark:text-white dark:text-opacity-80 font-semibold">
          {{ props.blog_db.estimated_reading_time || 0 }} mn read
          <span> · </span>
          <span>{{ formatDateToNow(props.blog_db.publish_date) }}</span>
        </p>
      </div>
    </div>
    <div class="my-5 border-y border-y-muted">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4 py-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <p class="flex items-center text-black dark:text-white cursor-pointer hover:opacity-60 transform duration-300"
                  @click="() => likePost(1, props.blog_db.id, currentUser?.id)">
                  <HandHeart />
                  <span class="pl-2">{{ props.blog_db.likes_count }}</span>
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>Like</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <NuxtLink :to="`${$route.fullPath}?#comment`"
                  class="flex items-center text-black dark:text-white cursor-pointer hover:opacity-60 transform duration-300">
                  <MessageCircleDashed />
                  <span class="pl-2">{{ props.blog_db.comments_count }}</span>
                </NuxtLink>
              </TooltipTrigger>

              <TooltipContent>
                <p>Comment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div class="flex items-center space-x-6 py-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <SavePostModal :currentUser="props.currentUser" :blog_db="props.blog_db"/>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button type="button" @click="copyLink"
                  class="text-black dark:text-white cursor-pointer hover:opacity-60 transform duration-300 align-bottom">
                  <MessageSquareShare />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <PostOptionDropdown :currentUser="props.currentUser" :blog_db="props.blog_db" />
              </TooltipTrigger>
              <TooltipContent>
                <p>More</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
    <div class="w-full h-full">
      <NuxtImg :src="props.blog_db.featured_image_url" alt="preview_img" densities="1x 2x" format="webp" quality="80"
        class="w-full h-full object-cover" />
    </div>
    <div class="my-10">
      <div v-html="props.blog_db.content" class="text-black dark:text-white text-md md:text-xl space-y-8"></div>
    </div>
    <Comment :blog_db="props.blog_db" :currentUser="props.currentUser" :authorDetails="authorDetails"
      :users="props.users" />
  </div>
</template>
