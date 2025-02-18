<script setup lang="ts">
import { useToast } from '~/components/ui/toast';
import type { BlogData } from '~/lib/type';

const props = defineProps<{
  post: BlogData | null;
}>();

const { toast } = useToast();
const { updateBlogPost } = useBlogPosts();

const seoTitle = ref(props.post?.seo_title || props.post?.title);
const seoDescription = ref(props.post?.seo_description || props.post?.subtitle);
const isSaving = ref(false);

const saveSeoSettings = async () => {
  isSaving.value = true;
  try {
    await updateBlogPost(props.post?.id ?? '', {
      seo_title: seoTitle.value,
      seo_description: seoDescription.value
    });
    
    toast({
      title: "SEO settings saved",
      description: "Your SEO settings have been updated successfully."
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to save SEO settings. Please try again.",
      variant: "destructive"
    });
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <section class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <h2 class="text-xl font-semibold mb-4">SEO Settings</h2>
    
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">SEO Title</label>
        <input
          v-model="seoTitle"
          type="text"
          class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">SEO Description</label>
        <textarea
          v-model="seoDescription"
          rows="3"
          class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div class="flex justify-end">
        <button 
          @click="saveSeoSettings"
          :disabled="isSaving"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="isSaving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </section>
</template>