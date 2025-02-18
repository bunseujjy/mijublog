<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCategories } from '~/server/categories/getCategories'

const categories = ref<any[]>([])
const isLoading = ref<boolean>(true)
const placeholderItems = Array.from({ length: 6 }, (_, index) => index + 1)

onMounted(async () => {
    try {
        const data = await getCategories()
        if (data) {
            categories.value = data
        }
    } catch (error) {
        console.error('Error fetching categories:', error)
    } finally {
        isLoading.value = false
    }
})
</script>

<template>
    <div class="w-full my-10 border-b border-b-slate-500">
        <h1 class="text-black dark:text-white text-xl md:text-2xl font-bold">
            Popular Categories
        </h1>
        <div v-if="isLoading">
            <div class="flex flex-wrap my-4">
                <PopularCategories v-for="n in placeholderItems" :key="n" />
            </div>
        </div>
        <ul v-else class="flex items-center flex-wrap mb-2">
            <div class="my-[6px] md:my-4" v-for="category in categories.sort((a,b) => b.post_length - a.post_length).slice(0, 6)" :key="category.id">
                <li class="bg-purple-400 text-white border border-purple-300 px-4 py-1 rounded-md mr-2">
                    <NuxtLink :to="`/categories/${category?.slug}`">{{ category?.name }}</NuxtLink>
                </li>
            </div>
        </ul>
    </div>
</template>