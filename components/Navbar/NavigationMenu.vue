<template>
      <div v-show="menuState" class="min-[877px]:hidden absolute left-0 right-0 top-16 bg-white dark:bg-foreground shadow-lg z-50">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <NuxtLink
            v-for="item in navigation"
            :key="item.title"
            :to="item.path"
            class="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-cyan-500 dark:hover:text-cyan-400 block px-3 py-2 rounded-md text-base font-medium transition duration-150 ease-in-out"
            @click="$emit('close')"
          >
            {{ item.title }}
          </NuxtLink>
        </div>
        <div class="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
          <div class="mt-3 px-2 space-y-1">
            <SearchBar class="mb-2" />
            <Switch class="mb-2" />
          </div>
        </div>
      </div>
</template>

<script setup lang="ts">
import type { Navigation } from '~/layouts/default.vue'

defineProps<{
  menuState: boolean,
  navigation: Navigation[],
}>()

defineEmits(['close'])
</script>