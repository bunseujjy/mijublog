<script setup lang="ts">
import { getAuthorDetails } from '~/lib/getAuthorDetails';

const route = useRoute();
const slug = route.params;
const { list_db, getListsBySlug, saved_posts, loadMoreListItems, isLoading, isScrolling } = useLists();
const { users, user } =useAuth();
const isClient = typeof  await window !== 'undefined';
const linkToCopy = computed(() => {
  const origin = isClient ? window.location.origin : `https://localhost:3000/@${getAuthorDetails(users.value, list_db.value?.user_id ?? '')?.user_metadata?.username}/lists/${slug.slug}`;
  return `${origin}${route.path}`;
});
</script>


<template>
  <div class="max-w-[780px] mx-auto px-4 md:px-0">
    <SingleList :slug="slug.slug" 
      :linkToCopy="linkToCopy" 
      :users="users" 
      :user="user" 
      :list_db="list_db"
      :getListsBySlug="getListsBySlug" 
      :saved_posts="saved_posts" 
      :loadMoreListItems="loadMoreListItems" 
      :isLoading="isLoading"
      :isScrolling="isScrolling" 
      />
  </div>
</template>