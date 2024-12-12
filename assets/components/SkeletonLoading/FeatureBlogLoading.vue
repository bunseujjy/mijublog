<script setup lang="ts">
import { Skeleton } from '../ui/skeleton';
</script>

<template>
    <div class="animate-pulse mr-2 mb-2">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton 
        class="relative h-full"
      />
      <div class="space-y-4">
        <div class="flex flex-col overflow-hidden rounded-lg shadow-md space-y-4">
         <Skeleton class="w-full h-[166.66667px] object-cover"/>
         <Skeleton class="w-full h-[166.66667px] object-cover"/>
         <Skeleton class="w-full h-[166.66667px] object-cover"/>
        </div>
      </div>
      </div></div>
</template>