<template>
    <NuxtLink to="/new_blog" class="text-black dark:text-white text-sm flex items-center">
      <SquarePen size="22"/>
      <span class="pl-2 hidden md:block">Write</span>
    </NuxtLink>
  </template>
  
  <script setup>
  import { SquarePen } from 'lucide-vue-next'
  </script>