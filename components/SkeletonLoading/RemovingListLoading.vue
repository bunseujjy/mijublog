<template>
  <div class="text-black dark:text-white">
    <!-- Author Profile Section -->
    <div class="flex items-start">
      <Skeleton class="w-14 h-14 rounded-full" />
      <div class="flex flex-col items-start pl-2.5">
        <Skeleton class="h-6 w-32 mb-1" /> <!-- Username -->
        <div class="flex items-center">
          <Skeleton class="h-4 w-36" /> <!-- Date and blog count -->
          <Skeleton class="h-4 w-4 ml-2" /> <!-- Lock icon -->
        </div>
      </div>
    </div>

    <!-- List Title and Description -->
    <div class="mt-4">
      <Skeleton class="h-8 w-64 mb-2" /> <!-- List name -->
      <Skeleton class="h-4 w-full max-w-md" /> <!-- Description -->
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center space-x-4 mt-4">
      <Skeleton class="h-6 w-20" /> <!-- Cancel button -->
      <Skeleton class="h-6 w-32" /> <!-- Remove Selected button -->
    </div>

    <!-- List Items -->
    <div class="space-y-10 mt-10">
      <div v-for="i in 5" :key="i" class="flex items-center border-b border-b-muted pb-4">
        <div class="flex items-center w-full">
          <Skeleton class="h-4 w-4 mr-2" /> <!-- Checkbox -->
          <Skeleton class="h-5 flex-1" /> <!-- Blog title -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>

<style scoped>
/* Add any custom styles if needed */
</style>