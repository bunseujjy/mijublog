<template>
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
  </template>
  
  <script setup>
  defineProps({
    menuState: {
      type: Boolean,
      required: true
    },
    navigation: {
      type: Array,
      required: true
    }
  })
  </script>