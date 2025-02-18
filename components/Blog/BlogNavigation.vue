<template>
    <TabsList class="w-full flex !items-start justify-start">
      <NuxtLink to="/me/stories/drafts">
        <TabsTrigger value="drafts">Drafts</TabsTrigger>
      </NuxtLink>
      <NuxtLink to="/me/stories/published">
        <TabsTrigger value="published">Published</TabsTrigger>
      </NuxtLink>
      <NuxtLink to="/me/stories/response">
        <TabsTrigger value="response">Response</TabsTrigger>
      </NuxtLink>
    </TabsList>
  </template>

  <script lang="ts" setup></script>