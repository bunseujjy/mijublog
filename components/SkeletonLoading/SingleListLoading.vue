<template>
  <div class="mt-10 text-black dark:text-white">
    <div class="flex items-start">
      <Skeleton class="w-14 h-14 rounded-full" />
      <div class="flex flex-col items-start pl-2.5 space-y-2">
        <Skeleton class="h-5 w-32" />
        <Skeleton class="h-4 w-48" />
      </div>
    </div>

    <div class="w-full h-full mt-10">
      <Skeleton class="h-8 w-3/4 mb-4" />
      <div class="border-y border-y-muted dark:border-y-gray-600 my-2 py-1">
        <div class="flex items-center justify-between">
          <div class="space-x-3">
            <Skeleton class="h-6 w-6 rounded-full inline-block" />
            <Skeleton class="h-6 w-6 rounded-full inline-block" />
          </div>
          <Skeleton class="h-6 w-6 rounded-full" />
        </div>
      </div>
    </div>

    <div class="w-full flex flex-col gap-10 mt-10">
      <div v-for="i in 2" :key="i" class="border-b border-b-muted pb-5">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div class="text-black dark:text-white flex-grow space-y-2 w-full md:w-2/3 mr-4">
            <div class="flex items-center">
              <Skeleton class="w-[35px] h-[35px] rounded-full" />
              <Skeleton class="h-4 w-24 ml-2" />
            </div>
            <Skeleton class="h-6 w-full" />
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-5/6" />

            <div class="flex items-center justify-between w-full mt-2">
              <div class="flex items-center space-x-4">
                <Skeleton class="h-5 w-5 rounded-full" />
                <Skeleton class="h-5 w-5 rounded-full" />
                <Skeleton class="h-5 w-5 rounded-full" />
              </div>
              <div class="flex space-x-2">
                <Skeleton class="h-6 w-6 rounded-full" />
                <Skeleton class="h-6 w-6 rounded-full" />
              </div>
            </div>
          </div>
          <div class="w-full md:w-[250px] aspect-[5/3] mt-4 md:mt-0">
            <Skeleton class="w-full h-full" />
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-6 mt-7">
      <div class="space-y-4 animate-pulse">
        <Skeleton class="w-32 h-7"/>
        <div class="h-32 bg-gray-200 rounded-xl dark:bg-gray-700 w-full mb-2.5"></div>
        <div class="h-10 bg-gray-200 rounded-md dark:bg-gray-700 w-32"></div>
      </div>

      <div v-for="i in 3" :key="i" class="animate-pulse">
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full dark:bg-gray-700"></div>
          <div class="flex-grow space-y-2">
            <div class="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-1/4"></div>
            <div class="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-full"></div>
            <div class="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-3/4"></div>
            <div class="flex space-x-3">
              <div class="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-10"></div>
              <div class="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-10"></div>
              <div class="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-10"></div>
            </div>
          </div>
        </div>

        <div v-if="i === 1" class="ml-14 mt-4 space-y-4">
          <div v-for="j in 2" :key="j" class="flex items-start space-x-4">
            <div class="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            <div class="flex-grow space-y-2">
              <div class="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-1/5"></div>
              <div class="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-full"></div>
              <div class="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-2/3"></div>
              <div class="flex space-x-3">
                <div class="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-8"></div>
                <div class="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-8"></div>
                <div class="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-8"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Skeleton } from '@/components/ui/skeleton'
</script>

<style scoped>
  /* Add any scoped styles here if needed */
</style>