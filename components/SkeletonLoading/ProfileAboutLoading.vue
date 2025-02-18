<script setup lang="ts">
    import { Loader2 } from "lucide-vue-next";
    import { Skeleton } from "../ui/skeleton";
</script>

<template>
    <div class="min-h-screen relative">
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
                    <div class="w-full flex items-start justify-start py-4 space-x-8">
                        <Skeleton class="h-8 w-16" />
                        <Skeleton class="h-8 w-16" />
                        <Skeleton class="h-8 w-16" />
                    </div>
                </div>
            </div>
        </nav>

        <!-- Centered Spinner -->
        <div class="absolute inset-0 flex items-center justify-center">
            <Loader2 class="animate-spin w-10 h-10 text-black dark:text-muted" />
        </div>
    </div>
</template>