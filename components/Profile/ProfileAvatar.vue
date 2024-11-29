<template>
    <div v-if="user" class="relative">
      <button
        @click="toggleDropdown"
        @blur="closeDropdown"
        class="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full"
      >
      <div class="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden">
        <NuxtImg
          :src="currentUser?.user_metadata?.profile_url || '/path/to/default-avatar.png'"
          :alt="currentUser?.user_metadata?.username"
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
          <NuxtLink
            v-for="item in menuItems"
            :key="item.label"
            :to="item.href"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
            @click="handleMenuItemClick"
          >
            {{ item.label }}
          </NuxtLink>
          <button type="button" @click="handleSignOut" class="w-full block px-4 py-2 text-start text-sm text-gray-700 hover:bg-gray-100">Sign out</button>
        </div>
      </transition>
    </div>
    <div v-else>
      <NuxtLink href="/signin" class="text-white">Login</NuxtLink>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { ChevronDownIcon } from 'lucide-vue-next'

  const {currentUser} = defineProps(['currentUser'])	
  const isOpen = ref(false)
  const client = useSupabaseClient()
  const { $toast } = useNuxtApp()
  const router = useRouter()
  const user = useSupabaseUser()

  const handleSignOut = async () => {
    const {error} = await client.auth.signOut()
    if(error) {
      console.error('Error signing out:', error.message)
    } else {
      $toast.success("Signed out successfully")
      router.push('/signin')
    }
  }

  const menuItems = [
    { label: 'Your Profile', href: `@${encodeURIComponent(user.value?.user_metadata.username)}`, actions: null },
    { label: 'Settings', href: '/settings', actions: null },
  ]
  
  const toggleDropdown = () => {
    isOpen.value = !isOpen.value
  }
  
  const closeDropdown = () => {
    // Use a small delay to allow for clicking menu items
    setTimeout(() => {
      isOpen.value = false
    }, 100)
  }
  
  const handleMenuItemClick = () => {
    isOpen.value = false
    // Add any additional logic for menu item clicks here
  }

  onMounted(() => {
    watchEffect(() => {
      if(!user) {
        navigateTo('/')
      }
    })
  })
  </script>