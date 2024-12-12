<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import type { User } from '@supabase/supabase-js';
import { Gem, GripHorizontal, HandHeart, MessageCircleDashed, MessageSquareShare, Waypoints, Search, X, ChevronDown } from 'lucide-vue-next';
import { formattedDate } from '~/lib/formattedDate';
import { getAuthorDetails } from '~/lib/getAuthorDetails';
import type { BlogData } from '~/lib/type';
import { followCategory } from '~/server/categories/followCategory';
import { getBlogByCategories } from '~/server/categories/getBlogByCategory';
import { getCategories } from '~/server/categories/getCategories';
import { getCategory } from '~/server/categories/getCategory';
import { getCategoryFollowedBy } from '~/server/categories/getCategoryFollowedBy';

const route = useRoute();
const { user: currentUser } = useAuth();
const categories = shallowRef<any[]>([]);
const category = ref();
const selectedCategory = ref('');
const user = shallowRef<User[]>([]);
const isCategoryLoading = ref(true);
const isSearching = ref(false);
const isError = ref(false);
const errorMessage = ref('');
const category_slug = computed(() => route.params.slug);
const isCurrentUserFollowing = ref<any[]>([]);
const searchText = ref('');
const searchResults = ref<any[]>([]);
const visibleCategories = ref(9);
const isLoadingMore = ref(false);

const filteredCategories = computed(() => {
  return categories.value.slice(0, visibleCategories.value);
});

const debouncedSearch = useDebounce(searchInput, 300);

async function searchInput() {
  if (searchText.value.length < 2) {
    searchResults.value = [];
    return;
  }
  
  isSearching.value = true;
  try {
    const findData = categories.value.filter((c) => 
      c.name.toLowerCase().includes(searchText.value.toLowerCase())
    );
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    searchResults.value = findData || [];
  } catch (error) {
    console.error('Search error:', error);
    errorMessage.value = 'An error occurred while searching. Please try again.';
  } finally {
    isSearching.value = false;
  }
}

function clearSearch() {
  searchText.value = '';
  searchResults.value = [];
}

async function loadMoreCategories() {
  if (isLoadingMore.value) return;
  isLoadingMore.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading delay
    visibleCategories.value += 9;
  } catch (error) {
    console.error('Error loading more categories:', error);
    errorMessage.value = 'Failed to load more categories. Please try again.';
  } finally {
    isLoadingMore.value = false;
  }
}

const handleCategoryClick = (slug: string) => {
    navigateTo(`/categories/${slug}`)
};

const handleKeyDown = (event: KeyboardEvent, index: number) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    focusNextResult(index);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    focusPreviousResult(index);
  } else if (event.key === 'Enter') {
    event.preventDefault();
    handleCategoryClick(searchResults.value[index].slug);
  }
};

const focusNextResult = (currentIndex: number) => {
  const nextIndex = (currentIndex + 1) % searchResults.value.length;
  focusResult(nextIndex);
};

const focusPreviousResult = (currentIndex: number) => {
  const previousIndex = (currentIndex - 1 + searchResults.value.length) % searchResults.value.length;
  focusResult(previousIndex);
};

const focusResult = (index: number) => {
  nextTick(() => {
    const element = document.getElementById(`search-result-${index}`);
    if (element) element.focus();
  });
};

onMounted(async () => {
  try {
    const [cat, users] = await Promise.all([getCategories(), getAllUser()]);
    categories.value = cat || [];
    user.value = users || [];

    if (category.value?.id && currentUser.value?.id) {
      const categoryFollowed = await getCategoryFollowedBy(
        category.value.id,
        currentUser.value.id
      );
      isCurrentUserFollowing.value = categoryFollowed || [];
    }
  } catch (err) {
    console.error("Failed to fetch categories or users:", err);
    isError.value = true;
    errorMessage.value = "Failed to load categories and users. Please refresh the page.";
  } finally {
    isCategoryLoading.value = false;
  }
});

watch(searchText, debouncedSearch);

function useDebounce(fn: Function, delay: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
</script>

<template>
  <div class="flex flex-col px-4 max-w-screen-xl mx-auto md:px-8 mt-10">
    <div class="flex flex-wrap items-center justify-center text-white mb-8">
      <p class="flex items-center text-sm text-black dark:text-white border border-black dark:border-muted rounded-full px-3 py-1 m-2">
        <Waypoints :size="19" class="mr-2"/> Explore Categories
      </p>
      <TransitionGroup name="category-list" tag="div" class="flex flex-wrap justify-center">
        <div v-for="cat in filteredCategories.slice(0, 18)" :key="cat.id" class="m-2">
          <button
            :class="['text-sm text-black dark:text-white border border-black dark:border-muted rounded-full hover:bg-white hover:text-black transform duration-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500', {
              'text-white bg-muted-foreground border-muted-foreground': category_slug === cat?.slug
            }]"
            @click="handleCategoryClick(cat.slug)"
          >
            {{ cat.name }}
          </button>
        </div>
      </TransitionGroup>
    </div>

    <button
      v-if="categories.length > visibleCategories"
      @click="loadMoreCategories"
      class="mx-auto mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      :disabled="isLoadingMore"
    >
      <span v-if="!isLoadingMore">View More Categories</span>
      <span v-else class="flex items-center">
        Loading <ChevronDown class="ml-2 animate-bounce" />
      </span>
    </button>

    <h1 class="text-black dark:text-muted text-center text-lg md:text-4xl font-bold mt-14">Explore Topics</h1>
    
    <form @submit.prevent="searchInput" class="relative w-full mt-10 mx-auto max-w-xl">
      <div class="relative">
        <input
          type="text"
          placeholder="Search anything"
          class="w-full dark:text-white py-2 px-6 pr-12 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-300"
          v-model="searchText"
          @input="debouncedSearch"
          @keydown.down.prevent="focusNextResult(0)"
        >
        <button
          type="submit"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition duration-300"
          :disabled="isSearching"
        >
          <Search v-if="!isSearching" />
          <span v-else class="animate-spin">⌛</span>
        </button>
      </div>

      <TransitionGroup
        name="search-results"
        tag="ul"
        class="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg"
        v-if="searchResults.length > 0"
      >
        <li
          v-for="(result, index) in searchResults"
          :key="result.id"
          :id="`search-result-${index}`"
          tabindex="0"
          @keydown="(e) => handleKeyDown(e, index)"
          @click="handleCategoryClick(result.slug)"
          class="dark:text-white px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition duration-300 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
        >
        <NuxtLink 
        :to="`/categories/${result.slug}`">
            {{ result.name }}
        </NuxtLink>
        </li>
      </TransitionGroup>
    </form>

    <p v-if="isSearching" class="text-center mt-4 text-gray-600 dark:text-gray-400">Searching...</p>
    <p v-else-if="searchText && searchResults.length === 0" class="text-center mt-4 text-gray-600 dark:text-gray-400">No results found</p>

    <div v-if="errorMessage" class="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
.category-list-enter-active,
.category-list-leave-active {
  transition: all 0.5s ease;
}
.category-list-enter-from,
.category-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.search-results-enter-active,
.search-results-leave-active {
  transition: all 0.3s ease;
}
.search-results-enter-from,
.search-results-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>