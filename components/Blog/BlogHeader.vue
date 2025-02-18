<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <header class="bg-white dark:bg-foreground text-black dark:text-white ">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between">
        <h1 class="text-xl md:text-3xl font-bold">{{ title }}</h1>
        <Button class="px-4 py-4 text-white">Write a Post</Button>
      </div>
    </div>
  </header>
</template>