<script setup lang="ts">
import { ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { CircleMinus, CirclePlus, Flag, GripVertical, PencilLine, Pin, UserRoundPlus, UserRoundX } from 'lucide-vue-next'
import type { BlogData } from '~/lib/type'
import { showMoreOrLess } from '~/server/post/showMoreOrLess'
import { followAuthor } from '~/server/user/followAuthor'
import { unfollowAuthor } from '~/server/user/unfollowAuthor'
import { getPublicUser } from '~/server/user/getPublicUser'
import { getUserInfo } from '~/server/user/getUserInfo'
import type { Database } from '~/supabase'
import { useToast } from '../ui/toast'

const props = defineProps<{
  currentUser: User | null
  blog_db: BlogData
}>()

const supabase = useSupabaseClient<Database>();
const { toast } = useToast()
const isModalOpen = ref(false)
const isDropdownOpen = ref(false)
const user = ref<any>()

const openModal = () => {
  isModalOpen.value = true
  isDropdownOpen.value = false
}

const closeModal = () => {
  isModalOpen.value = false
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const pinPost = async () => {
  const data = await supabase.from("blog_posts").update({
    pin: props.blog_db.pin === false ? true : false
  }).eq('id', props.blog_db.id).select('*')
  
  if(data) {
    toast({description: props.blog_db.pin === true ? "This blog has been unpinned from your profile's homepage" : "This blog has been pinned to your profile's homepage"})
  }
}

onMounted(async () => {
  // Fetch initial user info
  user.value = await getUserInfo()

  // Subscribe to changes on the "user_info" table
  supabase
    .channel("user_info")
    .on('postgres_changes', { event: "*", schema: "public", table: "user_info" }, (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        user.value = payload.new
      } else if (payload.eventType === 'DELETE') {
        console.log(payload.new)
        user.value = []
      }
    })
    .subscribe()

    supabase.channel('blog_posts').on('postgres_changes', {event: "UPDATE", schema: "public", table: "blog_posts"}, (payload) => {
      props.blog_db.pin = payload.new.pin
    }).subscribe();
  // Unsubscribe when component unmounts
 
})

onUnmounted(() => {
  supabase.channel("user_info").unsubscribe();
  supabase.channel("blog_post").unsubscribe();
  })
</script>

<template>
  <div>
    <DropdownMenu :open="isDropdownOpen" @update:open="isDropdownOpen = $event">
      <DropdownMenuTrigger as-child>
        <Button  class="text-black dark:text-white align-bottom cursor-pointer hover:opacity-60 transform duration-300">
          <GripVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56 dark:bg-gray-800 dark:text-white dark:border-muted-foreground" v-if="blog_db.author_id !== currentUser?.id">
        <DropdownMenuGroup>
          <DropdownMenuItem class="!flex-col" @click="showMoreOrLess(currentUser?.id ?? '', blog_db.category_id, 'more'); closeDropdown()">
            <div class="w-full flex items-center">
              <CirclePlus class="mr-2 h-4 w-4" />
              <span>Show More</span>
              <DropdownMenuShortcut>⇧⌘M</DropdownMenuShortcut>
            </div>
            <span class="text-xs break-words px-2">Recommend more posts like this to me.</span>
          </DropdownMenuItem>
          <DropdownMenuItem class="!flex-col" @click="showMoreOrLess(currentUser?.id ?? '', blog_db.category_id, 'less'); closeDropdown()">
            <div class="w-full flex items-center">
              <CircleMinus class="mr-2 h-4 w-4" />
              <span>Show Less</span>
              <DropdownMenuShortcut>⇧⌘L</DropdownMenuShortcut>
            </div>
            <span class="text-xs break-words px-2">Recommend fewer posts like this to me.</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem v-if="user.length === 0" @click="followAuthor(currentUser?.id ?? '', 1, currentUser?.id ?? '', blog_db.author_id); closeDropdown()">
            <UserRoundPlus class="mr-2 h-4 w-4" />
            <span>Follow Author</span>
          </DropdownMenuItem>
          <DropdownMenuItem v-else @click="unfollowAuthor(1, currentUser?.id ?? '', blog_db.author_id); closeDropdown()">
            <UserRoundX class="mr-2 h-4 w-4" />
            <span>Unfollow Author</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click.stop="openModal">
            <Flag class="mr-2 h-4 w-4" />
            <Button variant="outline" class="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 !bg-transparent !p-0 !border-0">
              Report Post...
            </Button>
            <DropdownMenuShortcut>⌘+R</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
      <DropdownMenuContent v-else>
        <DropdownMenuGroup>
          <DropdownMenuItem class="!flex-col">
            <NuxtLink :to="`/post/@${currentUser.user_metadata?.username}/${blog_db.id}/edit`" class="w-full flex items-center">
              <PencilLine class="mr-2 h-4 w-4" />
              <span>Edit Blog</span>
              <DropdownMenuShortcut>⇧⌘E</DropdownMenuShortcut>
            </NuxtLink>
          </DropdownMenuItem>
          <DropdownMenuItem class="!flex-col cursor-pointer" @click="pinPost(); closeDropdown()">
            <div class="w-full flex items-center">
              <Pin class="mr-2 h-4 w-4" />
              <span v-if="blog_db.pin === false">Pin this blog to your profile</span>
              <span v-else>Unpin this blog from your profile</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
    <ReportPostModal v-if="isModalOpen" @closeModal="closeModal" :blog_db="blog_db" :currentUser="currentUser"/>
  </div>
</template>

