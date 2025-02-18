<script setup lang="ts">
import { Search, Waypoints } from 'lucide-vue-next';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { useMagicKeys } from '@vueuse/core';
import { getCategories } from '~/server/categories/getCategories';
import type { User } from '@supabase/supabase-js';
import type { Category } from '~/lib/type';
import { DialogTitle, DialogDescription } from '../ui/dialog';

const open = ref(false)
const modal = ref(false)
const ignoreElRef = ref();
const text = ref<string>('')
const allUsers = ref<User[]>([])
const allCategories = ref<Category[]>([])

const closeModal = () => {
  modal.value = false;
};

const onClickOutsideHandler = [
  (ev: any) => {
    modal.value = false
  },
  { ignore: [ignoreElRef] },
]

const searchInput = (e: Event) => {
  const inputValue = e.target as HTMLInputElement
  text.value = inputValue.value
  if(text.value !== '') {
    allCategories.value.filter((data) => data.name.toLocaleLowerCase().includes(text.value));
    allUsers.value.filter((data) => data.user_metadata?.username.toLocaleLowerCase().includes(text.value));
  }
}

const { Meta_J, Ctrl_J } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.key === 'j' && (e.metaKey || e.ctrlKey))
      e.preventDefault()
  },
})

watch([Meta_J, Ctrl_J], (v) => {
  if (v[0] || v[1])
    handleOpenChange()
})

function handleOpenChange() {
  open.value = !open.value
}

onMounted(async () => {
  const [users, categories] = await Promise.all([
    getAllUser(),
    getCategories(),
  ])
  allUsers.value = users || [];
  allCategories.value = categories || []
})
</script>

<template>
  <form class="w-52 relative">
    <!-- Search Result -->
    <div>
      <div 
        class="relative w-full h-7 text-xs py-1 pl-2 bg-white dark:bg-black border border-slate-200 dark:border-gray-600 outline-none rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 ring-transparent mr-2 shrink-0 text-black dark:text-white cursor-pointer placeholder:text-xs align-top" 
        @click="handleOpenChange"
      >
        Search User or Categories...
      </div>
      <kbd
        class="absolute top-1 right-1 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-black dark:text-gray-400 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
      >
        <span class="text-xs">⌘</span>J
      </kbd>
    </div>
    <CommandDialog 
      :open="open" 
      @update:open="handleOpenChange" 
      class="max-w-[450px] w-full h-full bg-white dark:bg-gray-800 placeholder:text-black dark:placeholder:text-white border border-white dark:border-gray-700 shadow-md rouded-none"
    >
      <DialogTitle class="sr-only">Search</DialogTitle>
      <DialogDescription class="sr-only">
        Search for users and categories across the platform
      </DialogDescription>
      
      <CommandInput 
        placeholder="Type to search..." 
        @click="modal = true" 
        @input="searchInput" 
        class="text-black dark:text-white h-9 bg-white dark:bg-gray-800"
      />
      <CommandList ref="ignoreElRef">
        <PerfectScrollbar>
          <div v-click-outside="onClickOutsideHandler" class="h-[300px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions" class="bg-white dark:bg-gray-800">
              <CommandItem value="calendar" class="text-black dark:text-white hover:dark:text-white">
                <NuxtLink
                  to="/explore-topics"
                  @click="closeModal"
                  class="flex items-center text-sm px-3 py-1 mr-2"
                >
                  <Waypoints :size="19" class="mr-2" /> Explore Categories
                </NuxtLink>
              </CommandItem>
            </CommandGroup>
            
            <CommandGroup heading="Users" class="bg-white dark:bg-gray-800">
              <div v-for="user in allUsers.slice(0, 6)" :key="user.id">
                <NuxtLink :to="`@${user?.user_metadata?.username}`" @click="closeModal">
                  <CommandItem 
                    :value="user?.user_metadata?.username" 
                    class="text-black dark:text-white hover:dark:text-white"
                  >
                    <NuxtImg format="webp" loading="lazy" 
                      :src="user?.user_metadata?.profile_url" 
                      alt="user_avatar" 
                      class="size-[35px] object-cover rounded-full"
                    /> 
                    <span class="pl-2">{{ user.user_metadata?.username }}</span>
                  </CommandItem>
                </NuxtLink>
              </div>
            </CommandGroup>
            
            <CommandGroup heading="Categories" class="bg-white dark:bg-gray-800">
              <div v-for="category in allCategories.sort((a,b) => b.followers - a.followers).slice(0,6)" :key="category.id">
                <NuxtLink :to="`/categories/${category?.slug}`" @click="closeModal">
                  <CommandItem 
                    :value="category.name" 
                    class="text-black dark:text-white hover:dark:text-white"
                  >
                    {{ category.name }}
                  </CommandItem>
                </NuxtLink>
              </div>
            </CommandGroup>
          </div>
        </PerfectScrollbar>
      </CommandList>
    </CommandDialog>
  </form>
</template>