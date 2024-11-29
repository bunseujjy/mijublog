<script setup>
import { SquarePen } from 'lucide-vue-next';
import { ref, onMounted } from 'vue';

const currentUser = ref();
// Navigation items
const navigation = [
  { title: "Homepage", path: "/" },
  { title: "Contact", path: "#" },
  { title: "About", path: "#" },
  { title: "Write", path: "#" }
];

const menuState = ref(false);

onMounted(async () => {
    await getCurrentUser(currentUser)
});
</script>

<template>
<header>
    <nav class="bg-white dark:bg-foreground py-3 md:py-0">
    <div class="flex items-center space-x-8 px-4 max-w-screen-xl mx-auto md:px-8">
      <div class="flex-none lg:flex-initial">
        <NuxtLink to="/" class="cursor-pointer">
          <h1 class="text-cyan-400 font-bold text-2xl">Miju<span class="text-black dark:text-white">Blog</span></h1>
        </NuxtLink>
      </div>
      <div class="flex-1 flex items-center justify-between">
        <div
          class="dark:bg-foreground absolute z-20 w-full top-[56px] left-0 p-4 lg:static lg:block lg:border-none"
          :class="{ 'hidden': !menuState }"
        >
          <ul class="space-y-5 lg:flex lg:space-x-6 lg:space-y-0 lg:mt-0">
            <li
              v-for="(item, idx) in navigation"
              :key="idx"
              class="text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-cyan-500 transform duration-300"
            >
              <NuxtLink :to="item.path">{{ item.title }}</NuxtLink>
            </li>
          </ul>
        </div>
        <div class="flex-1 flex items-center justify-end space-x-2 sm:space-x-6">
          <form class="w-36 md:w-auto flex items-center space-x-2 border rounded-md py-1 md:py-2 p-2 z-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 flex-none text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              class="w-full dark:bg-transparent outline-none appearance-none placeholder-gray-500 text-gray-500 dark:text-white sm:w-auto"
              type="text"
              placeholder="Search"
            />
          </form>
          <NuxtLink to="new_blog" class="text-black dark:text-white text-sm flex items-center"><SquarePen size="22"/> <span class="pl-2">Write</span></NuxtLink>
         <toggle-mode />
          <ProfileAvatar :currentUser="currentUser"/>
          <button
            class="outline-none text-gray-400 block lg:hidden"
            @click="menuState = !menuState"
          >
            <svg
              v-if="menuState"
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

  </nav>
    <div>
        <slot />
    </div>
</header>

</template>