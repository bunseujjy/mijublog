<script setup lang="ts">
import { Skeleton } from '../ui/skeleton'
import { ref } from 'vue'
import { CircleMinus, ThumbsUp, MessageCircle, Share2, MoreHorizontal } from 'lucide-vue-next'
import type { Comment, Replies } from '~/lib/type';

const props = defineProps<{
    comments: Comment[];
    reply: Replies[]
}>()
</script>

<template>
  <div class="comment-thread relative mb-8">
    <div class="flex">
      <div class="mr-3 flex flex-col items-center relative">
        <Skeleton class="w-10 h-10 rounded-full" />
        
        <div v-if="props.comments.length > 0" class="threadline flex items-end justify-end align-start relative bg-neutral-background mt-2">
          <div class="box-border h-full border-0 border-white/20 border-solid border-b-[1px] cursor-pointer w-[calc(50%+0.5px)] border-l-[1px] rounded-bl-[12px] flex items-end justify-end">
            <div class="flex items-end relative -right-6 top-3">
              <CircleMinus class="text-muted-foreground" :size="20" />
            </div>
          </div>
          <div class="box-border h-full border-0 border-white border-solid border-b-[1px] cursor-pointer absolute right-[-8px]">
          </div>
        </div>
      </div>
      <div class="flex-grow">
        <div class="rounded-lg">
          <Skeleton class="h-5 w-32 mb-2" />
          <Skeleton class="h-4 w-full mb-1" />
          <Skeleton class="h-4 w-5/6 mb-3" />
          <div class="flex space-x-4 mb-3">
            <div class="flex items-center space-x-1">
              <ThumbsUp class="text-muted-foreground" :size='16' />
              <Skeleton class="h-4 w-8" />
            </div>
            <div class="flex items-center space-x-1">
              <MessageCircle class="text-muted-foreground" :size='16' />
              <Skeleton class="h-4 w-12" />
            </div>
            <div class="flex items-center space-x-1">
              <Share2 class="text-muted-foreground" :size='16' />
              <Skeleton class="h-4 w-12" />
            </div>
            <div class="flex items-center">
              <MoreHorizontal class="text-muted-foreground" :size='16' />
            </div>
          </div>
        </div>
        <div v-if="props.comments.length > 0" class="mt-4 space-y-4 relative">
          <div v-for="i in reply" :key="i.id" class="ml-8">
            <div class="flex">
              <Skeleton class="w-8 h-8 rounded-full mr-3" />
              <div class="flex-grow">
                <Skeleton class="h-4 w-24 mb-2" />
                <Skeleton class="h-3 w-full mb-1" />
                <Skeleton class="h-3 w-5/6 mb-2" />
                <div class="flex space-x-4">
                  <div class="flex items-center space-x-1">
                    <ThumbsUp class="text-muted-foreground" :size='14' />
                    <Skeleton class="h-3 w-6" />
                  </div>
                  <div class="flex items-center space-x-1">
                    <MessageCircle class="text-muted-foreground" :size='14' />
                    <Skeleton class="h-3 w-10" />
                  </div>
                  <div class="flex items-center space-x-1">
                    <Share2 class="text-muted-foreground" :size='14' />
                    <Skeleton class="h-3 w-10" />
                  </div>
                  <div class="flex items-center">
                    <MoreHorizontal class="text-muted-foreground" :size='14' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.threadline {
  width: 2px;
  background-color: rgba(255, 255, 255, 0.2);
}
</style>