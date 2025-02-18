<script setup lang="ts">
import { Skeleton } from '../ui/skeleton';

</script>

<template>
  <div class="min-h-screen">
    <!-- Profile Header Skeleton -->
    <header class="shadow">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center space-x-6">
          <Skeleton class="h-24 w-24 rounded-full" />
          <div class="space-y-2">
            <Skeleton class="h-8 w-48" />
            <Skeleton class="h-4 w-32" />
          </div>
        </div>
      </div>
    </header>

    <!-- Tab Navigation Skeleton -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex space-x-8">
          <div class="w-full flex items-start justify-start py-4 space-x-8 p-1">
            <Skeleton class="h-8 w-16" />
            <Skeleton class="h-8 w-16" />
            <Skeleton class="h-8 w-16" />
          </div>
        </div>
      </div>
    </nav>

    <!-- Content Area Skeleton -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <Skeleton class="h-8 w-48 mb-6" />
      <div class="space-y-6">
        <Skeleton v-for="i in 3" :key="i" />
      </div>
    </main>

    <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8  space-y-4">
      <div v-for="i in 3" :key="i" class="border-b border-b-muted pb-5 transition-all duration-300 ease-in-out mt-5">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div class="text-black dark:text-white flex-grow mr-4">
              <div class="flex items-center">
                <Skeleton class="size-[35px] rounded-full" />
                <Skeleton class="w-24 h-4 ml-2" />
              </div>
              <div class="w-full mt-4">
                <Skeleton class="w-3/4 h-6 mt-2" />
                <Skeleton class="w-full h-4 mt-2" />
                <Skeleton class="w-full h-4 mt-1" />
                <div class="mt-2">
                  <Skeleton class="w-1/2 h-3" />
                </div>
              </div>
              <div class="flex items-center justify-between w-full mt-4">
                <div class="flex items-center space-x-4 mt-2 mb-3 md:mt-0 md:mb-0">
                  <Skeleton class="w-6 h-6" />
                  <Skeleton class="w-6 h-6" />
                  <Skeleton class="w-6 h-6" />
                </div>
                <div class="flex space-x-2 md:mr-2 mt-2 mb-3 md:mt-0 md:mb-0">
                  <Skeleton class="w-6 h-6" />
                  <Skeleton class="w-6 h-6" />
                </div>
              </div>
            </div>
            <div class="w-full md:w-[250px] aspect-[5/3] flex-shrink-0">
              <Skeleton class="w-full h-full" />
            </div>
          </div>
        </div>
    </section>
  </div>
</template>