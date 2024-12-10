<script setup>
const props = defineProps({
  currentColor: {
    type: String,
    required: true
  }
})
const particles = ref([]);

onMounted(() => {
  particles.value = Array.from({ length: 5 }, (_, n) => ({
    delay: `${(n + 1) * 0.5}s`,
    size: `${Math.random() * 2 + 1}px`,
  }));
});
</script>

<template>
  <div 
    class="planet"
    :style="{
      '--border-color': currentColor,
      '--shadow-color': currentColor
    }"
  >
    <div class="planet-rings">
      <div class="ring ring-1"></div>
      <div class="ring ring-2"></div>
      <div class="ring ring-3"></div>
    </div>
    
    <div class="planet-atmosphere"></div>
    
    <div class="planet-surface">
      <div class="surface-highlight"></div>
      <div class="surface-glow"></div>
    </div>
    
    <div class="orbit-particles">
    <div 
      v-for="(particle, index) in particles" 
      :key="index"
      class="particle"
      :style="{
        '--delay': particle.delay,
        '--size': particle.size,
      }"
    ></div>
  </div>
  </div>
</template>

<style scoped>
.planet {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  box-shadow: 0px 4px 24px var(--shadow-color);
  position: relative;
  overflow: hidden;
  transition: all 1s ease-in-out;
  margin-bottom: 2rem;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
}

.planet-rings {
  position: absolute;
  inset: -20%;
  animation: rotate 20s linear infinite;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 2s ease-in-out;
}

.ring-1 {
  inset: 10%;
  animation: pulse 4s ease-in-out infinite;
}

.ring-2 {
  inset: 20%;
  animation: pulse 4s ease-in-out infinite reverse;
}

.ring-3 {
  inset: 30%;
  animation: pulse 4s ease-in-out infinite;
}

.planet-atmosphere {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 70% 70%, transparent 0%, rgba(255, 255, 255, 0.1) 100%);
  animation: rotate 15s linear infinite reverse;
}

.planet-surface {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  overflow: hidden;
}

.surface-highlight {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 60%);
  animation: rotate 25s linear infinite;
}

.surface-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 70% 70%, var(--border-color) 0%, transparent 60%);
  opacity: 0.3;
  animation: pulse 4s ease-in-out infinite;
}

.orbit-particles {
  position: absolute;
  inset: 0;
  animation: rotate 15s linear infinite;
}

.particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: var(--border-color);
  border-radius: 50%;
  animation: orbit 10s linear infinite;
  animation-delay: var(--delay);
  opacity: 0.6;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}

@keyframes orbit {
  0% {
    transform: translate(150px, 150px) rotate(0deg) translate(-150px, -150px);
  }
  100% {
    transform: translate(150px, 150px) rotate(360deg) translate(-150px, -150px);
  }
}

.particle:nth-child(1) { top: 20%; left: 20%; }
.particle:nth-child(2) { top: 30%; right: 20%; }
.particle:nth-child(3) { bottom: 20%; left: 30%; }
.particle:nth-child(4) { bottom: 30%; right: 30%; }
.particle:nth-child(5) { top: 50%; right: 50%; }
</style>