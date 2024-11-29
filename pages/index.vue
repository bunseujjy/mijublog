<script setup lang="ts">

import { ref, onMounted } from 'vue';
import type { BlogData } from '~/lib/type';
import { getCategories } from '~/server/categories/getCategories';
import { getRecentPost } from '~/server/post/getRecentBlog';
import type { Database } from '~/supabase';

const isLoading = ref(true);
const isError = ref(false);
const blogs = ref<BlogData | null>(null);
const blog_db = ref<BlogData[]>([]);
const categories = ref();
const currentUser = ref();

// Call the fetch function when component is mounted
onMounted(async () => {
    isLoading.value = true;
    isError.value = false;

    try {
      const data = await $fetch<BlogData>('/data.json', { headers: useRequestHeaders(['cookie'])  });
      blogs.value = data;
    } catch (err) {
      console.error('Error fetching data:', err);
      isError.value = true;
    } finally {
      isLoading.value = false;
    }
    await getCurrentUser(currentUser)
    try {
      const data = await getRecentPost();
      if(data)
      blog_db.value = data;
    } catch (err) {
      console.error('Error fetching data:', err);
      isError.value = true;
    } finally {
      isLoading.value = false;
    }
    try {
      const data = await getCategories();
      if(data)
      categories.value = data
    } catch (error) {
      console.error('Error fetching data:', error);
      isError.value = true;
    } finally {
      isLoading.value = false;
    }
});
</script>

<template>
    <div class="bg-white dark:bg-foreground">
        <main>
            <HeroSection />
        </main>
        <section class="px-4 max-w-screen-xl mx-auto md:px-8">
            <Categories :categories="categories"/>
            <FeatureBlog :blog_db="blog_db"/>
            <RecentBlog :blogs="blogs" :blog_db="blog_db" :currentUser="currentUser" :isLoading="isLoading" :isError="isError"/>
        </section>
        <footer>
          <Footer />
        </footer>
    </div>
</template>