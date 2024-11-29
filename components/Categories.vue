<script setup lang="ts">
    import { getCategories } from '~/server/categories/getCategories';

    const categories = ref<any[]>([]);

    // Call the fetch function when component is mounted
    onMounted(async () => {
        try {
            const data = await getCategories();
            if (data)
                categories.value = data
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    });
</script>

<template>
    <div class="w-full my-10 border-b border-b-slate-500">
        <h1 class="text-black dark:text-white text-xl md:text-2xl font-bold">
            Popular Categories
        </h1>
        <ul class="flex items-center">
            <div class="my-4" v-for="cat in categories" :key="cat.id">
                <li class="bg-purple-400 text-white border border-purple-300 px-4 py-2 rounded-md mr-2">
                    <NuxtLink :to="`/categories/${cat?.slug}`">{{ cat?.name }}</NuxtLink>
                </li>
            </div>
        </ul>
    </div>
</template>