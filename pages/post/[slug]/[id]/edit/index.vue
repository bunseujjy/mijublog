<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { BlogData } from '~/lib/type';

const route = useRoute()
const post_id = ref(route.params.id)
const client = useSupabaseClient()
const blog_db = ref<BlogData | null>(null)

const getBlogData = async () => {
  const { data, error } = await client
    .from("blog_posts")
    .select("*")
    .eq("id", post_id.value)

  if (error) {
    console.error(error.message)
  }

  // Ensure data is not empty before assigning to blog_db
  if (data && data.length > 0) {
    blog_db.value = data[0] // Get the first blog post since Supabase returns an array
  } else {
    blog_db.value = null // In case no data is found, you can handle the empty state here
  }
}

// Watch for route changes to keep `post_id` updated if the route changes
watch(() => route.params.id, (newId) => {
  post_id.value = newId
})

// Watch blog_db and update SEO metadata when it changes
watch(blog_db, (newBlog) => {
  if (newBlog) {
    useSeoMeta({
      title: `Edit ${newBlog.title}`,
      ogTitle: `Edit ${newBlog.title}`,
      ogImage: newBlog.featured_image_url || '/open-graph.png',
      ogDescription: newBlog.subtitle,
      description: newBlog.subtitle,
      ogUrl: `${import.meta.env.VITE_BASE_URL}${route.fullPath}`,
      twitterTitle: `Edit ${newBlog.title}`,
      twitterDescription: `Edit ${newBlog.subtitle}`,
      twitterImage: newBlog.featured_image_url || '/open-graph.png',
    })
  }
}, { immediate: true })

onMounted(() => {
  getBlogData()
})
</script>

<template>
  <div>
    <ClientOnly>
      <TextEditor :post_id="post_id" />
    </ClientOnly>
  </div>
</template>