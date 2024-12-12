<script setup lang="ts">
import { Skeleton } from '../ui/skeleton';

const placeholderItems = computed(() => {
  return Array.from({ length:  3 }, (_, index) => index + 1);
});
</script>

<template>
    <div class="animate-pulse mr-2 mb-2">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="my-4"  v-for="n in placeholderItems" :key="n" >
            <div class="w-full h-full">
               <Skeleton class="w-full h-[200px]"/>
                <div class="flex items-center justify-between mt-2">
                    <div class="flex items-center">
                       <Skeleton class="w-[35px] h-[35px] rounded-full"/>
                       <Skeleton class="w-[100px] h-[15px] ml-2"/>
                    </div>
                    <Skeleton class="w-[100px] h-[15px] pl-2"/>
                </div>
                <div class="mt-2">
                    <Skeleton class="w-full h-[15px] my-2" />
                    <Skeleton class="w-[80%] h-[15px] my-2" />
                    <Skeleton class="w-[50%] h-[15px] my-2" />
                </div>
            </div>
        </div>
        </div>
    </div>
</template>