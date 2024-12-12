<template>
    <div class="w-full max-w-md">
      <div class="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            {{ title }}
          </h1>
          <p class="text-gray-400 mt-2">{{ subtitle }}</p>
        </div>
  
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    title: String,
    subtitle: String
  })
  </script>