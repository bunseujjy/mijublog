<template>
  <header>
    <Toaster />
    <nav class="bg-white dark:bg-foreground py-3 md:py-0">
      <div class="flex items-center space-x-8 px-4 max-w-screen-xl mx-auto md:px-8">
        <div class="flex-none lg:flex-initial">
          <NuxtLink to="/" class="cursor-pointer">
            <h1 class="text-cyan-400 font-bold text-2xl">Miju<span class="text-black dark:text-white">Blog</span></h1>
          </NuxtLink>
        </div>
        <div class="flex-1 flex items-center justify-between">
          <NavigationMenu :menu-state="menuState" :navigation="navigation" />
          <div class="flex-1 flex items-center justify-end space-x-2 sm:space-x-6">
            <SearchBar />
            <WriteButton />
            <Switch />
            <ProfileAvatar />
            <MobileMenuButton :menu-state="menuState" @toggle="menuState = !menuState" />
          </div>
        </div>
      </div>
    </nav>
    <slot />
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { Toaster } from '~/components/ui/toast';

const menuState = ref(false)
const navigation = [
  { title: "Home", path: "/" },
  { title: "Contact", path: "#" },
  { title: "About", path: "#" },
]
</script>