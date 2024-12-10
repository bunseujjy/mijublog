<template>
  <div class="bg-white dark:bg-foreground">
      <Head>
          <Title>Honepage</Title>
          <Meta name="description" content="Discover the world of Chinese or Korean dramas with us! Dive into captivating stories, explore a community of fans, and find everything you need to start your dramas journey."/>
        </Head>
      <main>
          <HeroSection />
      </main>
      <section class="px-4 max-w-screen-xl mx-auto md:px-8">
          <Categories :categories="homeData.categories"/>
          <FeatureBlog :blog_db="homeData.blog_db.value" :isLoading="homeData.isLoading.value"/>
          <RecentBlog 
            :blog_db="homeData.blog_db.value" 
            :currentUser="currentUser" 
            :isLoading="homeData.isLoading.value"
            :isError="homeData.isError.value"
          />
      </section>
      <footer>
        <Footer />
      </footer>
  </div>
</template>

<script setup lang="ts">
const { user: currentUser } = useAuth()
const homeData = useHomeData()

onMounted(homeData.fetchHomeData)
</script>