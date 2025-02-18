<script setup lang="ts">
import { useToast } from '~/components/ui/toast';
import type { BlogData } from '~/lib/type';

const props = defineProps<{
  post: BlogData | null;
}>();

const { toast } = useToast();
const { updateBlogPost } = useBlogPosts();

const visibility = ref(props.post?.visibility);
const allowComments = ref(props.post?.allow_comments);
const isSaving = ref(false);

const saveSettings = async () => {
  isSaving.value = true;
  try {
    await updateBlogPost(props.post?.id ?? '', {
      visibility: visibility.value,
      allow_comments: allowComments.value
    });
    
    toast({
      title: "Settings saved",
      description: "Your story settings have been updated successfully."
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to save settings. Please try again.",
      variant: "destructive"
    });
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <section class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <h2 class="text-xl font-semibold mb-4">Publishing Settings</h2>
    
    <div class="space-y-6">
      <div>
        <label class="block text-sm font-medium mb-2">Visibility</label>
        <select 
          v-model="visibility"
          class="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-medium">Comments</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300">Allow readers to comment on your story</p>
        </div>
        <Switch v-model="allowComments" />
      </div>

      <div class="flex justify-end">
        <button 
          @click="saveSettings"
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