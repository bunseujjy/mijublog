<script setup lang="ts">
import { BookAudio, LogOut, Settings, User } from 'lucide-vue-next';
const { user, signOut } =useAuth()
const isOpen = ref(false)

const menuItems = computed(() => [
  { 
    label: 'Your Profile',
    href: `/@${encodeURIComponent(user.value?.user_metadata?.username)}`,
    icon: User
  },
  { 
    label: 'Settings', 
    href: '/settings',
    icon: Settings
  },
  {
    label: 'Stories',
    href: '/me/stories/drafts',
    icon: BookAudio
  }
])

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  setTimeout(() => {
    isOpen.value = false
  }, 100)
}

const handleMenuItemClick = () => {
  isOpen.value = false
}

const handleSignOut = async () => {
  await signOut()
}

</script>

<template>
  <div v-if="user" class="relative">
    <button 
      @click="toggleDropdown" 
      @blur="closeDropdown"
      class="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full"
    >
      <div class="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden">
        <NuxtImg format="webp" loading="lazy" 
          :src="user.user_metadata?.profile_url || '/default-pf.png'"
          :alt="user.user_metadata?.username"
          class="w-full h-full object-cover border-2 border-gray-200 rounded-full" 
        />
      </div>
    </button>

    <transition 
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-show="isOpen"
        class="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="user-menu"
        
      >
      <div class="flex items-center text-gray-700 hover:bg-gray-100 pl-2" v-for="item in menuItems" :key="item.label" >
        <component :is="item.icon" class="text-xs"/>
        <NuxtLink
          :to="item.href"
          class="block px-4 py-2 text-sm flex-1"
          role="menuitem"
          @click="handleMenuItemClick"
        >
          {{ item.label }}
        </NuxtLink>
      </div>
      <div class="flex items-center hover:bg-gray-100 pl-3">
        <LogOut />
        <button
          type="button"
          @click="handleSignOut"
          class="w-full block px-4 py-2 text-start text-sm text-gray-700"
        >
          Sign out
        </button>
      </div>
      </div>
    </transition>
  </div>
  <div v-else>
    <NuxtLink to="/signin" class="text-white">Login</NuxtLink>
  </div>
</template>