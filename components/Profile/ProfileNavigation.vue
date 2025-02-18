<template>
    <TabsList class="w-full text-black dark:text-white flex !items-start justify-start !bg-transparent py-4 space-x-8">
      <NuxtLink :to="`/${username}`">
        <TabsTrigger value="home">Home</TabsTrigger>
      </NuxtLink>
      <NuxtLink :to="`/${username}/lists`">
        <TabsTrigger value="lists">Lists</TabsTrigger>
      </NuxtLink>
      <NuxtLink :to="`/${username}/about`">
        <TabsTrigger value="about">About</TabsTrigger>
      </NuxtLink>
    </TabsList>
</template>

<script lang="ts" setup>
import type { User } from '@supabase/supabase-js'
defineProps<{
  username: string
}>()
</script>