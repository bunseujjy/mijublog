<script setup lang="ts">

const skeletonCount = ref(3) // Number of skeleton items to show
</script>

<template>
  <div class="w-full lg:w-[70%] flex flex-col gap-10 mt-5" aria-busy="true" aria-live="polite">
    <div v-for="i in skeletonCount" :key="i" class="border-b border-b-muted pb-5 animate-pulse">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div class="text-black dark:text-white flex-grow space-y-2 w-full md:w-2/3">
          <div class="flex items-center">
            <div class="size-[35px] bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 ml-2"></div>
          </div>
          <div class="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
          <div class="flex space-x-2">
            <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
            <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
          </div>
          <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
        </div>
        <div class="w-full md:w-[250px] aspect-[5/3] bg-gray-300 dark:bg-gray-700 rounded mt-4 md:mt-0"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>