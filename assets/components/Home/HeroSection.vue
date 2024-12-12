<script setup>
import { ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import PlanetAnimation from './PlanetAnimation.vue'

const colors = ['#13FFAA', '#1E67C6', '#CE84CF', '#DD335C']
const currentColorIndex = ref(0)
const currentColor = ref(colors[0])

const nextColor = () => {
  currentColorIndex.value = (currentColorIndex.value + 1) % colors.length
  currentColor.value = colors[currentColorIndex.value]
}

useIntervalFn(nextColor, 6000)
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
          <h1>Welcome to Our Blog</h1>
          <p>Discover the world of Chinese or Korean dramas with us! Dive into captivating stories, explore a community of fans, and find everything you need to start your dramas journey.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-container {
  position: relative;
  min-height: 600px;
  overflow: hidden;
}

.planet-gradient {
  position: relative;
  width: 100%;
  height: 100%;
  background: radial-gradient(125% 125% at 50% 0%, #000 50%, var(--current-color));
  transition: all 8s ease-in-out;
}

.content-wrapper {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 600px;
  padding: 2rem;
}

.text-content {
  text-align: center;
  color: white;
  max-width: 800px;
}

.text-content h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  background: linear-gradient(to right, var(--current-color), white);
  -webkit-background-clip: text;
  color: transparent;
  transition: all 2s ease-in-out;
}

.text-content p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
}
</style>