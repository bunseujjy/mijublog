<script setup lang="ts">
const route = useRoute();
const { getBlogPostByID } = useBlogPosts();
const post = ref(await getBlogPostByID(route.params.id as string));

// Watch for route changes to keep `post_id` updated if the route changes
watch(() => route.params.id, (newId) => {
  route.params.id = newId
})

// Watch blog_db and update SEO metadata when it changes
watch(post, (newBlog) => {
  if (newBlog) {
    useSeoMeta({
      title: `Setting | ${newBlog.title}`,
      ogTitle: `Setting | ${newBlog.title}`,
      ogImage: newBlog.featured_image_url || '/open-graph.png',
      ogDescription: newBlog.subtitle,
      description: newBlog.subtitle,
      ogUrl: `${import.meta.env.VITE_BASE_URL}${route.fullPath}`,
      twitterTitle: `Setting | ${newBlog.title}`,
      twitterDescription: `Setting | ${newBlog.subtitle}`,
      twitterImage: newBlog.featured_image_url || '/open-graph.png',
    })
  }
}, { immediate: true })
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-black dark:text-white">Story Settings</h1>
    
    <div class="space-y-8 text-black dark:text-white">
      <StoryPreview :post="post" />
      <PublishSettings :post="post" />
      <TagSettings :post="post" />
      <SeoSettings :post="post" />
      <DangerZone :post="post" />
    </div>
  </div>
</template>