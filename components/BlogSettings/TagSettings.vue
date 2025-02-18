<script setup lang="ts">
import { useToast } from '~/components/ui/toast';
import type { BlogData } from '~/lib/type';

const props = defineProps<{
  post: BlogData | null;
}>();

const { toast } = useToast();
const { updateBlogPost } = useBlogPosts();
const tags = ref(props.post?.tags || []);
const newTag = ref('');
const isSaving = ref(false);

const addTag = () => {
  if (newTag.value && !tags.value.includes(newTag.value)) {
    tags.value.push(newTag.value);
    newTag.value = '';
  }
};

const removeTag = (tag: string) => {
  tags.value = tags.value.filter(t => t !== tag);
};

const saveTags = async () => {
  isSaving.value = true;
  try {
    await updateBlogPost(props.post?.id ?? '', { tags: tags.value });
    toast({
      title: "Tags saved",
      description: "Your story tags have been updated successfully."
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to save tags. Please try again.",
      variant: "destructive"
    });
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <section class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <h2 class="text-xl font-semibold mb-4">Tags</h2>
    
    <div class="space-y-4">
      <div class="flex gap-2 flex-wrap">
        <span 
          v-for="tag in tags" 
          :key="tag"
          class="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center gap-2"
        >
          {{ tag }}
          <button @click="removeTag(tag)" class="text-gray-500 hover:text-gray-700">×</button>
        </span>
      </div>
      
      <div class="flex gap-2">
        <input
          v-model="newTag"
          type="text"
          placeholder="Add a tag"
          class="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          @keyup.enter="addTag"
        />
        <button 
          @click="addTag"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Add
        </button>
      </div>

      <div class="flex justify-end">
        <button 
          @click="saveTags"
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