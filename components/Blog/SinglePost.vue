<script setup lang="ts">
import type { BlogData } from "~/lib/type";
import { formatDateToNow } from "~/lib/formattedDate";
import {
  Bookmark,
  GripVertical,
  HandHeart,
  Link2,
  MessageCircleDashed,
  MessageCircleHeart,
} from "lucide-vue-next";
import type { User } from "@supabase/supabase-js";
import { likePost } from "~/server/post/likePost";
import { useToast } from "../ui/toast";

const props = defineProps<{
  blog_db: BlogData;
  currentUser: User | null;
  users: User[];
}>();
const route = useRoute();
const { toast } = useToast();
const isLiking = ref(false);

const handleLikePost = async () => {
  isLiking.value = true;
  try {
    await likePost(1, props.blog_db.id, props.currentUser?.id ?? "");
  } finally {
    isLiking.value = false;
  }
};

const linkToCopy = computed(() => {
  return `${window.location.origin}${route.path}`;
});
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(linkToCopy.value);
    toast({ description: "Link copied to clipboard" });
  } catch (error) {
    toast({
      description: "Failed to copy link. Please try again.",
      variant: "destructive",
    });
  }
};
computed(() => {
  const words = props.blog_db.content?.split(/\s+/).length;
  const readingSpeed = 200; // words per minute
  return Math.ceil(words! / readingSpeed) || 1; // Default to 1 minute
});
useSeoMeta({
  title: props.blog_db.title,
  description: props.blog_db.subtitle,
  keywords: props.blog_db.tags.join(', '),
  ogTitle: props.blog_db.title,
  ogDescription: props.blog_db.subtitle,
  ogImage: props.blog_db.featured_image_url,
  ogUrl: linkToCopy,
  twitterTitle: props.blog_db.title,
  twitterDescription: props.blog_db.subtitle,
  twitterImage: props.blog_db.featured_image_url,
  twitterCard: 'summary_large_image',
})

</script>

<template>
  <div class="mt-14">
    <h1 class="text-black dark:text-white text-4xl font-bold">
      {{ props.blog_db.title }}
    </h1>
    <p class="text-xl font-semibold text-[#6B6B6B] dark:text-slate-300 mt-2">
      {{ props.blog_db.subtitle }}
    </p>
    <div class="flex items-center mt-5">
      <NuxtImg format="webp" loading="lazy"
        :src="
          findPostAuthor(users, props.blog_db.author_id)?.user_metadata
            .profile_url || '/default-pf.jpg'
        "
        alt="profile"
        class="size-[50px] rounded-full bg-center object-cover"
      />
      <div class="flex flex-col items-start pl-2">
        <NuxtLink
          :to="`/@${findPostAuthor(users, props.blog_db.author_id)?.user_metadata?.username || 'unknown'}`"
          class="w-auto inline-block text-black dark:text-white hover:text-opacity-60 transform duration-300"
        >
          {{
            findPostAuthor(users, props.blog_db.author_id)?.user_metadata
              ?.username || "Unknown User"
          }}
        </NuxtLink>
        <p
          class="text-[#6B6B6B] dark:text-white dark:text-opacity-80 font-semibold"
        >
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
                <button
                  type="button"
                  class="flex items-center text-black dark:text-white hover:opacity-60 transform duration-300"
                  @click="handleLikePost"
                  :class="{ 'cursor-not-allowed': isLiking, 'opacity-50 cursor-not-allowed' : props.blog_db.author_id === currentUser?.id}"
                  :disabled="props.blog_db.author_id === currentUser?.id"
                  >
                  <MessageCircleHeart />
                  <span class="pl-2">{{ props.blog_db.likes_count }}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p v-if="props.blog_db.author_id !== currentUser?.id">Like</p>
                <p v-else>You cannot like your own post</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <NuxtLink
                  :to="`${$route.fullPath}?#comment`"
                  class="flex items-center text-black dark:text-white cursor-pointer hover:opacity-60 transform duration-300"
                >
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
                <SavePostModal
                  :currentUser="props.currentUser"
                  :blog_db="props.blog_db"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Save</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <Button
                  type="button"
                  @click="copyLink"
                  class="text-black dark:text-white !bg-transparent align-bottom cursor-pointer hover:bg-transparent hover:opacity-60 transform duration-300"
                  aria-label="Copy link to clipboard"
                >
                  <Link2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <PostOptionDropdown
                  :currentUser="props.currentUser"
                  :blog_db="props.blog_db"
                />
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
      <NuxtImg format="webp" loading="lazy"
        :src="props.blog_db.featured_image_url || '/post_placeholder.png'"
        alt="preview_img"
        densities="1x 2x"
        quality="80"
        class="w-full h-[400px] object-cover"
        placeholder="blur"
      />
    </div>
    <div class="my-10">
      <div
        v-html="props.blog_db.content"
        class="text-black dark:text-white text-md md:text-xl space-y-8"
      ></div>
    </div>
    <Comment
      :blog_db="props.blog_db"
      :list_db="null"
      :currentUser="props.currentUser"
      :users="props.users"
      type="blog"
    />
  </div>
</template>
