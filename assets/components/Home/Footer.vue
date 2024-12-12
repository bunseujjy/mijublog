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
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">Home</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">About Us</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">Latest Reviews</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">Drama News</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">Contact</a></li>
            </ul>
          </div>
  
          <!-- Categories -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Categories</h3>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">Romance</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">Action</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">Comedy</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">Drama</a></li>
              <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-300">Fantasy</a></li>
            </ul>
          </div>
        </div>
  
        <!-- Newsletter Signup -->
        <div class="mt-12 border-t border-gray-800 pt-8">
          <h3 class="text-lg font-semibold mb-4">Subscribe to Our Newsletter</h3>
          <p class="text-gray-400 mb-4">Stay updated with our latest reviews and drama news!</p>
          <form @submit.prevent="subscribeNewsletter" class="flex flex-col sm:flex-row gap-4">
            <input 
              v-model="email" 
              type="email" 
              placeholder="Your email address" 
              required 
              class="flex-grow px-4 py-2 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
            <button 
              type="submit" 
              class="px-6 py-2 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700 transition-colors duration-300"
            >
              Subscribe
            </button>
          </form>
        </div>
  
        <!-- Copyright -->
        <div class="mt-12 text-center text-gray-400">
          <p>&copy; {{ currentYear }} Asian Drama Blog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { TwitterIcon, FacebookIcon, InstagramIcon, YoutubeIcon } from 'lucide-vue-next';
  
  const email = ref('');
  const currentYear = computed(() => new Date().getFullYear());
  
  const subscribeNewsletter = () => {
    // Implement newsletter subscription logic here
    console.log('Subscribing email:', email.value);
    // In a real application, you would send this to your backend or newsletter service
    alert(`Thank you for subscribing with ${email.value}!`);
    // Reset email input after submission
    email.value = '';
  };
  </script>