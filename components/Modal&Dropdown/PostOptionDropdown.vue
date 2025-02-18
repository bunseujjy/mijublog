<script setup lang="ts">
import type { User } from "@supabase/supabase-js";
import {
  CircleMinus,
  CirclePlus,
  Eraser,
  Flag,
  GripVertical,
  PencilLine,
  Pin,
  Settings2,
  UserRoundPlus,
  UserRoundX,
} from "lucide-vue-next";
import type { BlogData, FollowInfo } from "~/lib/type";
import { showMoreOrLess } from "~/server/post/showMoreOrLess";
import { followAuthor } from "~/server/user/followAuthor";
import { unfollowAuthor } from "~/server/user/unfollowAuthor";
import { getUserInfo } from "~/server/user/getUserInfo";
import type { Database } from "~/supabase";
import { useToast } from "../ui/toast";
import { deleteBlog } from "~/server/post/deleteBlog";
import { getAuthorDetails } from "~/lib/getAuthorDetails";

const props = defineProps<{
  currentUser: User | null;
  blog_db: BlogData;
}>();

const supabase = useSupabaseClient<Database>();
const { toast } = useToast();
const { users } = useAuth();
const { followNotification, unfollowNotification } = await useNotifications();
const isModalOpen = ref(false);
const isDropdownOpen = ref(false);
const followInfo = ref<FollowInfo[]>([]);

const openModal = () => {
  isModalOpen.value = true;
  isDropdownOpen.value = false;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const pinPost = async () => {
  const data = await supabase
    .from("blog_posts")
    .update({
      pin: props.blog_db.pin === false ? true : false,
    })
    .eq("id", props.blog_db.id)
    .select("*");

  if (data) {
    toast({
      description:
        props.blog_db.pin === true
          ? "This blog has been unpinned from your profile's homepage"
          : "This blog has been pinned to your profile's homepage",
    });
  }
};

const handleDelete = async () => {
  await deleteBlog(props.blog_db.id);
};

onMounted(async () => {
  // Fetch initial user info
  followInfo.value = (await getUserInfo()) as FollowInfo[];

  // Subscribe to changes in user_info
  supabase
    .channel("public:user_info")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "user_info" },
      (payload) => {
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          // Update followInfo when a follow/unfollow happens
          const newData = payload.new as FollowInfo;
          followInfo.value = [...followInfo.value, newData];
        } else if (payload.eventType === "DELETE") {
          // Remove deleted followInfo entry
          const deletedData = payload.old as FollowInfo;
          followInfo.value = followInfo.value.filter(
            (info) => info.id !== deletedData.id
          );
        }
      }
    )
    .subscribe();

  supabase
    .channel("public:blog_posts")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "blog_posts" },
      (payload) => {
        props.blog_db.pin = payload.new.pin;
      }
    )
    .subscribe();
  // Unsubscribe when component unmounts
});

onUnmounted(() => {
  supabase.channel("user_info").unsubscribe();
  supabase.channel("blog_post").unsubscribe();
});
</script>

<template>
  <div>
    <DropdownMenu :open="isDropdownOpen" @update:open="isDropdownOpen = $event">
      <DropdownMenuTrigger as-child>
        <Button
          class="text-black dark:text-white bg-transparent dark:bg-transparent align-bottom cursor-pointer hover:bg-transparent hover:opacity-60 transform duration-300"
        >
          <GripVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        class="w-56 dark:border-muted-foreground"
        v-if="blog_db.author_id !== currentUser?.id"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            class="!flex-col"
            @click="
              showMoreOrLess(
                currentUser?.id ?? '',
                blog_db.category_id,
                'more'
              );
              closeDropdown();
            "
          >
            <div class="w-full flex items-center">
              <CirclePlus class="mr-2 h-4 w-4" />
              <span>Show More</span>
              <DropdownMenuShortcut>⇧⌘M</DropdownMenuShortcut>
            </div>
            <span class="text-xs break-words px-2"
              >Recommend more posts like this to me.</span
            >
          </DropdownMenuItem>
          <DropdownMenuItem
            class="!flex-col"
            @click="
              showMoreOrLess(
                currentUser?.id ?? '',
                blog_db.category_id,
                'less'
              );
              closeDropdown();
            "
          >
            <div class="w-full flex items-center">
              <CircleMinus class="mr-2 h-4 w-4" />
              <span>Show Less</span>
              <DropdownMenuShortcut>⇧⌘L</DropdownMenuShortcut>
            </div>
            <span class="text-xs break-words px-2"
              >Recommend fewer posts like this to me.</span
            >
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <!-- Show Follow Author if the user is NOT following -->
          <DropdownMenuItem
            v-if="
              !followInfo.some(
                (data) =>
                  data.follower_id === currentUser?.id &&
                  data.author_id === blog_db.author_id
              )
            "
            @click="
              followAuthor(
                currentUser?.id ?? '',
                1,
                currentUser?.id ?? '',
                blog_db.author_id
              );
              closeDropdown();
              followNotification(blog_db.author_id);
            "
          >
            <UserRoundPlus class="mr-2 h-4 w-4" />
            <span>Follow Author</span>
          </DropdownMenuItem>

          <!-- Show Unfollow Author if the user IS following -->
          <DropdownMenuItem
            v-else
            @click="
              unfollowAuthor(1, currentUser?.id ?? '', blog_db.author_id);
              closeDropdown();
              unfollowNotification();
            "
          >
            <UserRoundX class="mr-2 h-4 w-4" />
            <span>Unfollow Author</span>
          </DropdownMenuItem>

          <!-- Report Post option -->
          <DropdownMenuItem @click.stop="openModal">
            <Flag class="mr-2 h-4 w-4" />
            <Button
              variant="outline"
              class="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 !bg-transparent !p-0 !border-0"
            >
              Report Post...
            </Button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
      <DropdownMenuContent v-else>
        <DropdownMenuGroup>
          <DropdownMenuItem class="!flex-col">
            <NuxtLink
              :to="`/post/@${currentUser.user_metadata?.username}/${blog_db.id}/edit`"
              class="w-full flex items-center"
            >
              <PencilLine class="mr-2 h-4 w-4" />
              <span>Edit Blog</span>
            </NuxtLink>
          </DropdownMenuItem>
          <DropdownMenuItem
            class="!flex-col cursor-pointer"
            @click="
              pinPost();
              closeDropdown();
            "
          >
            <div class="w-full flex items-center">
              <Pin class="mr-2 h-4 w-4" />
              <span v-if="blog_db.pin === false"
                >Pin this blog to your profile</span
              >
              <span v-else>Unpin this blog from your profile</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem class="!flex-col cursor-pointer">
            <div class="w-full flex items-center">
              <Settings2 class="mr-2 h-4 w-4" />
              <NuxtLink :to="`/post/@${getAuthorDetails(users, blog_db.author_id)?.user_metadata?.username}/${blog_db.id}/settings`">Blog Settings</NuxtLink>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem class="cursor-pointer" asChild>
            <AlertDeleteDialog
              title="Blog"
              :response="null"
              :reply="null"
              @handleDelete="handleDelete"
            >
              <template #icon>
                <Eraser />
              </template>
            </AlertDeleteDialog>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>

    <ReportPostModal
      v-if="isModalOpen"
      @closeModal="closeModal"
      :blog_db="blog_db"
      :currentUser="currentUser"
    />
  </div>
</template>
