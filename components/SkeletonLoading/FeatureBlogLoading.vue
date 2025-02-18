<script setup lang="ts">
// No props or logic needed for the loading component
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
    <!-- Main featured blog skeleton -->
    <div class="relative h-[400px] sm:h-[500px] animate-pulse">
      <div class="h-full rounded-lg bg-gray-200 dark:bg-gray-700">
        <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex flex-col justify-end">
          <div class="w-20 h-6 bg-gray-300 dark:bg-gray-600 rounded-full mb-2"></div>
          <div class="w-3/4 h-8 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div class="w-full h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
          <div class="flex justify-between items-center">
            <div class="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div class="w-24 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Secondary featured blogs skeleton -->
    <div class="space-y-4">
      <div v-for="n in 3" :key="n" class="flex flex-col sm:flex-row bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
        <div class="w-full sm:w-[120px] md:w-[200px] h-[200px] bg-gray-200 dark:bg-gray-700"></div>
        <div class="flex-1 p-4">
          <div class="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full mb-2"></div>
          <div class="w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div class="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div class="flex justify-between items-center">
            <div class="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>