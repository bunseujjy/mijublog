<script setup lang="ts">
import { useToast } from '~/components/ui/toast';
import { useRouter } from 'vue-router';
import type { BlogData } from '~/lib/type';

const props = defineProps<{
  post: BlogData | null;
}>();

const router = useRouter();
const { toast } = useToast();
const { deleteBlogPost } = useBlogPosts();
const showDeleteDialog = ref(false);

const handleDelete = async () => {
  try {
    await deleteBlogPost(props.post?.id ?? '');
    toast({
      title: "Story deleted",
      description: "Your story has been permanently deleted."
    });
    router.push('/dashboard');
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to delete story. Please try again.",
      variant: "destructive"
    });
  }
  showDeleteDialog.value = false;
};
</script>

<template>
  <section class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <h2 class="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
    
    <div>
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        Once you delete a story, there is no going back. Please be certain.
      </p>
      
      <button 
        @click="showDeleteDialog = true"
        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Delete Story
      </button>
    </div>

    <Dialog :open="showDeleteDialog" @update:open="showDeleteDialog = false">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Story</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this story? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div class="flex justify-end gap-4 mt-4">
          <button 
            @click="showDeleteDialog = false"
            class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button 
            @click="handleDelete"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  </section>
</template>