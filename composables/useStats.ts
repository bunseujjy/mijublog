import type { Component } from 'vue'
import { Star, Eye, Clock, Heart } from 'lucide-vue-next'

interface Stat {
  icon: Component
  value: number
  target: number
  label: string
}

export const useStats = () => {
  const { monthlyVisitors } = useAnalytics()
  const { all_post } = useBlogPosts()
  const { users } = useAuth()

  // Create computed properties for the targets
  const totalPosts = computed(() => all_post.value?.length || 0)
  const totalVisitors = computed(() => monthlyVisitors.value || 0)
  const totalUsers = computed(() => users.value?.length || 0)

  // Make stats reactive using computed
  const stats = ref<Stat[]>([
    { icon: Star, value: 0, target: 0, label: 'Blog Posts Published' },
    { icon: Eye, value: 0, target: 0, label: 'Monthly Visitors' },
    { icon: Clock, value: 0, target: 1, label: 'Years Online' },
    { icon: Heart, value: 0, target: 0, label: 'Registered Users' }
  ])

  // Update targets when computed values change
  watch([totalPosts, totalVisitors, totalUsers], ([posts, visitors, users]) => {
    stats.value[0].target = posts
    stats.value[1].target = visitors
    stats.value[3].target = users
  }, { immediate: true })

  const animateStats = () => {
    stats.value.forEach((stat, index) => {
      let startTime: number | null = null
      const duration = 2000 // 2 seconds

      function animate(currentTime: number) {
        if (!startTime) startTime = currentTime
        const elapsedTime = currentTime - startTime
        const progress = Math.min(elapsedTime / duration, 1)
        
        stats.value[index].value = Math.round(progress * stat.target)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    })
  }

  return {
    stats,
    animateStats
  }
}