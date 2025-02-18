<script setup lang="ts">
import { Tv, Users, Clapperboard, Subtitles } from 'lucide-vue-next'
import { useIntersectionObserver } from '@vueuse/core'

const siteName = ref('MijuBlog')
const features = ref([
  {
    icon: Tv,
    title: 'Drama Reviews',
    description: 'In-depth reviews of the latest Chinese and Korean dramas, analyzing plot, acting, and production quality'
  },
  {
    icon: Users,
    title: 'Actor Profiles',
    description: 'Comprehensive profiles of popular and emerging actors and actresses from China and Korea',
  },
  {
    icon: Clapperboard,
    title: 'Industry News',
    description: 'Latest updates and trends in the Chinese and Korean entertainment industries'
  },
  {
    icon: Subtitles,
    title: 'Cultural Insights',
    description: 'Explanations of cultural references and historical contexts in dramas for better understanding'
  }
])

const { getAllPost } = useBlogPosts()
const { fetchMonthlyVisitors } = useAnalytics()
const { stats, animateStats } = await useStats()
const statsRef = ref(null)
const { stop } = useIntersectionObserver(
  statsRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      animateStats()
      stop()
    }
  },
  { threshold: 0.5 }
)

onMounted(async () => {
  await Promise.all([
    getAllPost(),
    fetchMonthlyVisitors()
  ])
})

useSeoMeta({
  title: "About Us",
  ogTitle: "About Us",
  ogUrl: `${import.meta.env.VITE_BASE_URL}/about`,
  twitterTitle: "About Us",
});
</script>

<template>
  <div class="bg-gray-100 dark:bg-gray-900 min-h-screen">
    <div class="container mx-auto px-4 py-12">
      <h1 class="text-5xl font-bold text-center text-gray-800 dark:text-white mb-6 animate-fade-in">About {{ siteName }}</h1>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-12 animate-slide-up">
          <div class="md:flex items-center">
            <div class="md:flex-shrink-0 mb-4 md:mb-0 md:mr-8">
              <NuxtImg format="webp" loading="lazy" class="h-48 w-48 rounded-full object-cover mx-auto" src="/developer.jpg" alt="Blog Author" />
            </div>
            <div>
              <h2 class="text-3xl font-semibold text-gray-800 dark:text-white mb-4">Welcome to MijuBlog</h2>
              <p class="text-gray-600 dark:text-white text-lg mb-4">
                Hi, I'm Bunseu, the sole creator and writer behind MijuBlog Insights. My passion for Chinese and Korean dramas has led me to create this space where I share in-depth reviews, cultural insights, and my personal thoughts on the captivating world of Asian entertainment.
              </p>
              <p class="text-gray-600 dark:text-white text-lg italic">
                "My mission is to bridge cultural gaps through the lens of Asian dramas, offering Western audiences a deeper understanding and appreciation of these compelling stories and the cultures they represent."
              </p>
            </div>
          </div>
        </div>
      
      <h2 class="text-4xl font-bold text-center text-gray-800 dark:text-white mb-12">What We Offer</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div v-for="(item, index) in features" :key="item.title" 
             class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 animate-slide-up"
             :style="{ animationDelay: `${index * 100}ms` }">
          <div class="flex items-center mb-4">
            <component :is="item.icon" class="w-10 h-10 text-purple-500 mr-4" />
            <h3 class="text-2xl font-semibold text-gray-800 dark:text-white">{{ item.title }}</h3>
          </div>
          <p class="text-gray-600 dark:text-gray-300 text-lg">{{ item.description }}</p>
        </div>
      </div>

      <div ref="statsRef" class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
        <div v-for="stat in stats" :key="stat.label" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center animate-fade-in">
          <component :is="stat.icon" class="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <div class="text-4xl font-bold text-gray-800 dark:text-white mb-2">{{ stat.value.toLocaleString() }}</div>
          <div class="text-gray-600 dark:text-gray-300">{{ stat.label }}</div>
        </div>
      </div>
      
      <div class="text-center animate-fade-in">
        <h2 class="text-3xl font-semibold text-gray-800 dark:text-white mb-4">Get in Touch</h2>
        <p class="text-gray-600 dark:text-gray-300 mb-6 text-lg">Have questions or want to suggest a drama for review? We'd love to hear from you!</p>
        <a href="mailto:contact@dramafever.com" class="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 text-lg">
          Contact Us
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

.animate-slide-up {
  animation: slideUp 1s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>