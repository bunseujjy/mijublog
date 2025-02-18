<script setup lang="ts">
    const { all_post, getAllPost, isLoading } = useBlogPosts()
    watch(all_post, (newValue) => {
        return newValue
    });

    onMounted(() => {
    getAllPost();
    });
    useSeoMeta({
        title: "Blog Post",
        ogTitle: 'Blog Post',
        ogUrl: `${import.meta.env.VITE_BASE_URL}`,
        twitterTitle: 'Blog Post',
    })
</script>

<template>
    <section class="max-w-screen-xl mx-auto flex items-center justify-center px-4 md:px-8 space-x-8">    
        <div v-if="isLoading" class="w-full">
      <AllBlogPostLoading />
    </div>
    <div v-else-if="!all_post">
      <p>No blog post found.</p>
    </div>
    <div v-else>
        <AllBlogPost :blog_db="all_post"/>
    </div>
    </section>
</template>