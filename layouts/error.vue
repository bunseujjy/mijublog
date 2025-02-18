<script setup lang="ts">
import type { NuxtError } from '#app'
import { Home, RefreshCw } from 'lucide-vue-next'

const props = defineProps({
  error: Object as () => NuxtError,
})

const router = useRouter()

const countdown = ref(10)
const mousePosition = ref({ x: 0, y: 0 })

const startCountdown = () => {
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value === 0) {
      clearInterval(timer)
      router.push('/')
    }
  }, 1000)

  onUnmounted(() => {
    clearInterval(timer)
  })
}

const handleMouseMove = (event: MouseEvent) => {
  mousePosition.value = {
    x: (event.clientX / window.innerWidth) * 100,
    y: (event.clientY / window.innerHeight) * 100,
  }
}

onMounted(() => {
  startCountdown()
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})

const goHome = () => {
  router.push('/')
}

const refreshPage = () => {
  window.location.reload()
}
</script>

<template>
  <div>
    <h1>{{ props.error && props.error.statusCode }}</h1>
    <div class="min-h-screen bg-slate-100 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
    <div class="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-gray-800 dark:to-gray-900 opacity-50"></div>
    <div class="absolute inset-0">
      <svg class="h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <path fill="rgba(100,116,139,0.1)" fill-opacity="1" d="M0,32L48,80C96,128,192,224,288,224C384,224,480,128,576,90.7C672,53,768,75,864,96C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
    </div>
    <div class="max-w-md w-full space-y-8 text-center relative z-10">
      <div 
        class="relative inline-block text-9xl font-extrabold text-slate-700 dark:text-gray-200"
        :style="{
          transform: `translate(${(mousePosition.x - 50) / 10}px, ${(mousePosition.y - 50) / 10}px)`
        }"
      >
        404
        <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <div class="w-32 h-32 bg-slate-400 dark:bg-gray-600 rounded-full opacity-10 blur-xl"></div>
        </div>
      </div>
      <h2 class="mt-6 text-3xl font-extrabold text-slate-800 dark:text-gray-100">
        Oops! Page Not Found
      </h2>
      <p class="mt-2 text-lg text-slate-600 dark:text-gray-300">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div class="mt-8 space-y-4">
        <button 
          @click="goHome"
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-gray-400 transition duration-150 ease-in-out"
        >
          <Home class="w-5 h-5 mr-2" />
          Go Home
        </button>
        <button 
          @click="refreshPage"
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-slate-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-gray-400 transition duration-150 ease-in-out"
        >
          <RefreshCw class="w-5 h-5 mr-2" />
          Refresh Page
        </button>
      </div>
      <p class="mt-6 text-sm text-slate-500 dark:text-gray-400">
        Redirecting to home in {{ countdown }} seconds...
      </p>
    </div>
  </div>
</div>
</template>

<style scoped>
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

.text-9xl {
  animation: float 6s ease-in-out infinite;
}
</style>