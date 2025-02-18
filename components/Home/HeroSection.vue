<script setup lang="ts">
import { ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { useIntersectionObserver } from '@vueuse/core'
import { ArrowRightToLine } from 'lucide-vue-next'


const colors = ['#13FFAA', '#1E67C6', '#CE84CF', '#DD335C']
const currentColorIndex = ref(0)
const currentColor = ref(colors[0])


const nextColor = () => {
  currentColorIndex.value = (currentColorIndex.value + 1) % colors.length
  currentColor.value = colors[currentColorIndex.value]
}

const { fetchMonthlyVisitors } = useAnalytics()
const { stats, animateStats } = useStats()
useIntervalFn(nextColor, 6000)

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
    fetchMonthlyVisitors()
  ])
})
</script>

<template>
  <div class="hero-container">
    <div 
      class="planet-gradient"
      :style="{
        '--current-color': currentColor,
      }"
    >
      <div class="content-wrapper">
        <PlanetAnimation :current-color="currentColor" />
        
        <div class="text-content">
          <div class="category-tag" :style="{ backgroundColor: currentColor }">
            Drama Blog
          </div>
          <h1>Explore the World of<br/>Asian Dramas</h1>
          <p>Discover captivating Chinese and Korean dramas through expert reviews, fan discussions, and comprehensive guides. Join our community of drama enthusiasts!</p>
          
          <div class="cta-buttons">
            <NuxtLink href="/post" class="primary-btn" :style="{ backgroundColor: currentColor }">
              Start Reading
              <ArrowRightToLine class="w-4 h-4 ml-2" />
            </NuxtLink>
            <NuxtLink href="/signin" class="secondary-btn">
              Join Community
            </NuxtLink>
          </div>

          <div class="stats-container">
            <div  ref="statsRef" v-for="(stat, index) in stats" :key="index" class="stat-item">
              <component :is="stat.icon" class="stat-icon" :style="{ color: currentColor }" />
              <div class="stat-text">
                <span class="stat-value" :style="{ color: currentColor }">{{ stat.value }}+</span>
                <span class="stat-label">{{ stat.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="gradient-overlay" :style="{ 
        background: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))`,
      }" />
    </div>
  </div>
</template>

<style scoped>
.hero-container {
  position: relative;
  min-height: 800px;
  overflow: hidden;
}

.planet-gradient {
  position: relative;
  width: 100%;
  height: 100%;
  background: radial-gradient(125% 125% at 50% 0%, #000 50%, var(--current-color));
  transition: all 8s ease-in-out;
}

.gradient-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  pointer-events: none;
}

.content-wrapper {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 800px;
  padding: 4rem 2rem;
}

.text-content {
  text-align: center;
  color: white;
  max-width: 800px;
}

.category-tag {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  transition: all 2s ease-in-out;
}

.text-content h1 {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  background: linear-gradient(to right, var(--current-color), white);
  -webkit-background-clip: text;
  color: transparent;
  transition: all 2s ease-in-out;
}

.text-content p {
  font-size: 1.25rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2.5rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 4rem;
}

.primary-btn {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.secondary-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.stats-container {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-icon {
  width: 24px;
  height: 24px;
  transition: all 2s ease-in-out;
}

.stat-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  transition: all 2s ease-in-out;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 768px) {
  .text-content h1 {
    font-size: 2.5rem;
  }

  .text-content p {
    font-size: 1.1rem;
  }

  .stats-container {
    flex-direction: column;
    gap: 1.5rem;
  }

  .stat-item {
    justify-content: center;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .primary-btn, .secondary-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>