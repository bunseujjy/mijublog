<script setup lang="ts">
import { TwitterIcon, FacebookIcon, InstagramIcon, YoutubeIcon } from 'lucide-vue-next';
import type { Category } from '~/lib/type';
import { getCategories } from '~/server/categories/getCategories';

const email = ref('');
const currentYear = computed(() => new Date().getFullYear());
const categories = ref<Category[]>([])


onMounted( async () => {
  const data = await getCategories()
  categories.value = data || []
})
</script>

<template>
    <footer class="bg-gray-900 text-white py-12">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Logo and Description -->
          <div class="col-span-1 md:col-span-2">
            <h2 class="text-2xl font-bold mb-4">Asian Drama Blog</h2>
            <p class="text-gray-400 mb-4">Discover the latest and greatest in Asian dramas. From romance to action, we've got you covered with reviews, news, and more.</p>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">
                <TwitterIcon class="w-6 h-6" />
                <span class="sr-only">Twitter</span>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">
                <FacebookIcon class="w-6 h-6" />
                <span class="sr-only">Facebook</span>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">
                <InstagramIcon class="w-6 h-6" />
                <span class="sr-only">Instagram</span>
              </a>
              <a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">
                <YoutubeIcon class="w-6 h-6" />
                <span class="sr-only">YouTube</span>
              </a>
            </div>
          </div>
  
          <!-- Quick Links -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
            <ul class="space-y-2">
              <li><NuxtLink href="/" class="text-gray-400 hover:text-white transition-colors duration-300">Home</NuxtLink></li>
              <li><NuxtLink href="/about" class="text-gray-400 hover:text-white transition-colors duration-300">About Us</NuxtLink></li>
              <li><NuxtLink href="/post" class="text-gray-400 hover:text-white transition-colors duration-300">Drama News</NuxtLink></li>
              <li><NuxtLink href="/contact" class="text-gray-400 hover:text-white transition-colors duration-300">Contact</NuxtLink></li>
            </ul>
          </div>
  
          <!-- Categories -->
          <div class="space-y-2">
            <h3 class="text-lg font-semibold mb-4">Categories</h3>
            <ul class="space-y-2" v-for="cat in categories.slice(0, 5)" :key="cat.id">
              <li><NuxtLink :href="`/categories/${cat.slug}`" class="text-gray-400 hover:text-white transition-colors duration-300">{{ cat.name }}</NuxtLink></li>
            </ul>
          </div>
        </div>
  
        <!-- Copyright -->
        <div class="mt-12 text-center text-gray-400">
          <p>&copy; {{ currentYear }} Asian Drama Blog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </template>