<script setup lang="ts">
import type { BlogData } from '~/lib/type';

const props = defineProps<{
  blog_db: BlogData[]
}>();
</script>


<template>
  <div class="w-full h-[600px] my-10">
    <h1 class="text-black dark:text-white text-xl md:text-2xl font-bold">Feature Blog</h1>
    <div class="relative w-full h-[333px] mt-4">
      <div v-for="blog in props.blog_db.slice(0, 1)" :key="blog?.id" class="relative float-left w-[50%] h-full">
        <Card class="relative h-full pt-32">
          <CardHeader>
            <CardTitle class="text-lg md:text-2xl font-bold text-white z-50">{{ blog?.title }}</CardTitle>
            <CardDescription class="text-md md:text-lg text-white z-50">{{ blog.subtitle.length > 140 ? blog.subtitle.slice(0, 140) + "..." : blog.subtitle }}</CardDescription>
          </CardHeader>
          <div
            class="absolute inset-0 z-0 w-auto h-full rounded-lg bg-center object-cover"
            :style="{ backgroundImage: `url(${blog?.featured_image_url})` }"
          ></div>
        </Card>
      </div>
      <div class="relative float-left w-[50%] h-full">
        <div class="flex flex-col ml-4">
          <div v-for="blog in props.blog_db.slice(0, 3)" :key="blog?.id"  class="mb-4">
            <Card class="relative flex border-0 shadow-transparent">
              <NuxtImg
                :src="blog?.featured_image_url"
                alt="blog"
                width="200px"
                height="125px"
                class="rounded-lg object-cover"
                :placeholder="15"
                sizes="100vw sm:50vw md:400px"
              />
              <div class="flex flex-col">
              <CardHeader class="pb-0">
                <h1>{{ blog?.title }}</h1>
              </CardHeader>
              <CardContent class="pb-0">
                <p>{{ blog.subtitle.length > 140 ? blog.subtitle.slice(0, 140) + "..." : blog.subtitle }}</p>
              </CardContent>
              <CardFooter class="text-center">
                <p>{{ blog?.publish_date }}</p>
              </CardFooter>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>