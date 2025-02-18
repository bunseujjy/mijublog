<script setup lang="ts">
import { Skeleton } from '../ui/skeleton'
import { MessageCircleHeart, MessageCircleDashed, Link2, MoreVertical, Bookmark } from 'lucide-vue-next'
</script>

<template>
  <div class="mt-14">
    <!-- Title and subtitle skeletons -->
    <Skeleton class="h-12 w-3/4 mb-4" />
    <Skeleton class="h-6 w-2/3 mb-8" />

    <!-- Author section skeleton -->
    <div class="flex items-center mt-5">
      <Skeleton class="size-[50px] rounded-full" />
      <div class="flex flex-col items-start pl-2 space-y-2">
        <Skeleton class="h-5 w-32" />
        <Skeleton class="h-4 w-48" />
      </div>
    </div>

    <!-- Action buttons skeleton -->
    <div class="my-5 border-y border-y-muted py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="flex items-center opacity-50">
            <MessageCircleHeart class="text-muted" />
            <Skeleton class="h-4 w-8 ml-2" />
          </div>
          <div class="flex items-center opacity-50">
            <MessageCircleDashed class="text-muted" />
            <Skeleton class="h-4 w-8 ml-2" />
          </div>
        </div>
        <div class="flex items-center space-x-6">
          <div class="opacity-50">
            <Bookmark class="text-muted" />
          </div>
          <div class="opacity-50">
            <Link2 class="text-muted" />
          </div>
          <div class="opacity-50">
            <MoreVertical class="text-muted" />
          </div>
        </div>
      </div>
    </div>

    <!-- Featured image skeleton -->
    <Skeleton class="w-full aspect-video mb-10" />

    <!-- Content skeleton -->
    <div class="space-y-4">
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-5/6" />
      <Skeleton class="h-4 w-4/5" />
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-3/4" />
    </div>

    <!-- Comments section skeleton -->
    <div class="mt-10 space-y-6">
      <Skeleton class="h-6 w-32 mb-4" />
      <div class="space-y-4">
        <div class="flex items-start space-x-4">
          <Skeleton class="size-10 rounded-full" />
          <div class="flex-1">
            <Skeleton class="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  @apply animate-pulse bg-muted;
}
</style>