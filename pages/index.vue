<template>
  <div class="bg-white dark:bg-foreground">
    <main>
      <HeroSection />
    </main>
    <section class="px-4 max-w-screen-xl mx-auto md:px-8">
      <Categories :categories="homeData.categories"/>
      <FeatureBlog :blog_db="posts" :isLoading="isLoading"/>
      <RecentBlog 
        :blog_db="posts" 
        :currentUser="currentUser" 
      />
    </section>
    <footer>
      <Footer />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useHomeData } from '~/composables/useHomeData'
import { useBlogPosts } from '~/composables/useBlogPosts'

const { user: currentUser } = useAuth()
const homeData = useHomeData()
const { all_post: posts, getAllPost } = useBlogPosts()

// Use proper async data handling
const { pending } = await useAsyncData('homepage', async () => {
  try {
    // Run fetches in parallel
    await Promise.all([
      homeData.fetchHomeData(),
      getAllPost()
    ])
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }
}, {
  // Ensure fresh data on page load
})

// Combine loading states
const isLoading = computed(() => pending.value)
</script>