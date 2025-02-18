<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'

const blogPostCount = 5
const recentListCount = 4
</script>

<template>
  <section class="max-w-screen-xl mx-auto flex items-center justify-center space-x-8">
    <div class="w-full flex flex-col lg:flex-row">
      <!-- Blog Posts Skeleton -->
      <div class="w-full lg:w-[70%] flex flex-col gap-10 mt-5">
        <div v-for="i in blogPostCount" :key="i" class="border-b border-b-muted pb-5 transition-all duration-300 ease-in-out mt-5">
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
      </div>

      <!-- Divider -->
      <div class="border-r border-r-muted px-4" />

      <!-- Right Sidebar Skeleton -->
      <div class="w-full md:w-[30%] h-[100vh] flex flex-col mt-14">
        <div class="w-full h-full text-black dark:text-white px-8">
          <div class="block">
            <Skeleton class="w-1/2 h-6 mb-4" />
            <div v-for="i in recentListCount" :key="i" class="mt-3">
              <div class="flex items-center">
                <Skeleton class="w-8 h-8 rounded-full" />
                <Skeleton class="w-24 h-4 ml-2" />
              </div>
              <div class="space-y-1 mt-2">
                <Skeleton class="w-3/4 h-5" />
                <Skeleton class="w-full h-3" />
                <Skeleton class="w-1/2 h-3" />
              </div>
            </div>
            <div class="mt-2 text-right">
              <Skeleton class="w-1/3 h-4 ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

