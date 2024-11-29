<script setup lang="ts">
import { ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { CircleMinus, CirclePlus, Flag, GripVertical, UserRoundPlus, UserRoundX } from 'lucide-vue-next'
import type { BlogData } from '~/lib/type'
import { showMoreOrLess } from '~/server/post/showMoreOrLess'
import { followAuthor } from '~/server/user/followAuthor'
import { unfollowAuthor } from '~/server/user/unfollowAuthor'
import { getPublicUser } from '~/server/user/getPublicUser'
import { getUserInfo } from '~/server/user/getUserInfo'

const props = defineProps<{
  currentUser: User
  blog_db: BlogData
}>()

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

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}


onMounted(async () => {
  // Fetch initial user info
  user.value = await getUserInfo(props.currentUser.id)

  const client = useSupabaseClient()
  // Subscribe to changes on the "user_info" table
  const channel = client
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

  // Unsubscribe when component unmounts
  onUnmounted(() => {
    client.removeChannel(channel)
  })
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
      <DropdownMenuContent class="w-56 dark:bg-gray-800 dark:text-white dark:border-muted-foreground">
        <DropdownMenuGroup>
          <DropdownMenuItem class="!flex-col" @click="showMoreOrLess(currentUser.id, blog_db.category_id, 'more'); closeDropdown()">
            <div class="w-full flex items-center">
              <CirclePlus class="mr-2 h-4 w-4" />
              <span>Show More</span>
              <DropdownMenuShortcut>⇧⌘M</DropdownMenuShortcut>
            </div>
            <span class="text-xs break-words px-2">Recommend more posts like this to me.</span>
          </DropdownMenuItem>
          <DropdownMenuItem class="!flex-col" @click="showMoreOrLess(currentUser.id, blog_db.category_id, 'less'); closeDropdown()">
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
          <DropdownMenuItem v-if="user.length === 0" @click="followAuthor(currentUser.id, 1, currentUser.id, blog_db.author_id); closeDropdown()">
            <UserRoundPlus class="mr-2 h-4 w-4" />
            <span>Follow Author</span>
          </DropdownMenuItem>
          <DropdownMenuItem v-else @click="unfollowAuthor(1, currentUser.id, blog_db.author_id); closeDropdown()">
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
    </DropdownMenu>
    <ReportPostModal v-if="isModalOpen" @closeModal="closeModal" :blog_db="blog_db" :currentUser="currentUser"/>
  </div>
</template>

