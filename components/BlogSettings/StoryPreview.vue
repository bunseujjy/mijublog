<script setup lang="ts">
import type { BlogData } from '~/lib/type';
defineProps<{
  post: BlogData | null;
}>();
</script>

<template>
  <section class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <h2 class="text-xl font-semibold mb-4">Story Preview</h2>
    <div class="space-y-4">
      <img 
        :src="post?.featured_image_url" 
        :alt="post?.title"
        class="w-full h-48 object-cover rounded-lg"
      />
      <h3 class="text-lg font-medium">{{ post?.title }}</h3>
      <p class="text-gray-600 dark:text-gray-300">{{ post?.subtitle }}</p>
    </div>
  </section>
</template>