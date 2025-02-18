<script setup lang="ts">
    import type { Lists } from '~/lib/type';
    import { Skeleton } from '../ui/skeleton';
    defineProps<{
        savedArticles: Lists[]
    }>()
</script>

<template>
    <div class="min-h-screen">
        <!-- Profile Header Skeleton -->
        <header class="shadow">
            <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="flex items-center space-x-6">
                    <Skeleton class="h-24 w-24 rounded-full" />
                    <div class="space-y-2">
                        <Skeleton class="h-8 w-48" />
                        <Skeleton class="h-4 w-32" />
                    </div>
                </div>
            </div>
        </header>

        <!-- Tab Navigation Skeleton -->
        <nav class="bg-white dark:bg-gray-800 shadow-sm">
            <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex space-x-8">
                    <div class="w-full flex items-start justify-start py-4 space-x-8 p-1">
                        <Skeleton class="h-8 w-16" />
                        <Skeleton class="h-8 w-16" />
                        <Skeleton class="h-8 w-16" />
                    </div>
                </div>
            </div>
        </nav>

        <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4" v-if="savedArticles.length === 0">
            <div class="mt-8">
                <Skeleton class="w-40 h-8 mb-6" />
            <div class="w-full h-[200px] bg-white dark:bg-gray-900 animate-pulse p-4 rounded-md mb-4"
                v-for="i in 3" :key="i">
                <div class="flex flex-col">
                    <div class="flex items-center justify-between">
                        <div class="space-y-4 ml-4 w-full">
                            <div class="flex items-center">
                                <Skeleton class="w-10 h-10 rounded-full mr-4" />
                                <Skeleton class="w-10 h-4" />
                            </div>
                            <div class="mb-6">
                                <div class="space-y-2 mb-6">
                                    <Skeleton class="w-56 h-4" />
                                    <Skeleton class="w-40 h-4" />
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                        <Skeleton class="w-20 h-4" />
                                        <Skeleton class="w-3 h-3 rounded-full ml-2" />
                                </div>
                                    <Skeleton class="w-6 h-6 mr-4"/>
                            </div>
                        </div>
                        <Skeleton class="w-[250px] h-[150px] bg-center object-cover" />
                    </div>
                </div>
            </div>
        </div>
        </section>
        <section v-else class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="mt-2">
                <Skeleton class="w-40 h-8 mb-6" />
                <Skeleton class="w-96 h-4" />
            </div>
        </section>
    </div>
</template>