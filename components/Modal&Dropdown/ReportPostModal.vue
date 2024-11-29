<script setup lang="ts">
import { ref, computed } from 'vue'
import { XIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import emailReportingPost from '~/server/app/emailReportingPost';
import type { BlogData } from '~/lib/type';
import type { User } from '@supabase/supabase-js';

const props = defineProps<{
    blog_db: BlogData,
    currentUser: User
}>();
const emit = defineEmits(['closeModal'])
const reason = ref('')
const description = ref('')

const closeModal = () => {
    emit('closeModal')
}

const isFormValid = computed(() => {
  return reason.value !== '' && description.value.trim() !== ''
})

const submitReport = async () => {
    if (reason.value) {
      try {
        await emailReportingPost(
          props.blog_db.id,
          props.currentUser.id,
          reason.value,
          description.value,
          props.currentUser.user_metadata.email,
          props.currentUser.user_metadata.username,
          props.blog_db.title
        );
        closeModal();
      } catch (error) {
        console.error('Failed to submit report:', error);
        // Handle error appropriately
      }
    }
  }
</script>


<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 cursor-default">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
        @click="closeModal"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        aria-label="Close modal"
        >
        <XIcon class="w-6 h-6" />
        </button>
        <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Report Blog Post</h2>
        <form @submit.prevent="submitReport">
        <div class="space-y-4">
            <div>
            <label for="report-reason" class="w-full text-start block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for reporting</label>
            <select
                id="report-reason"
                v-model="reason"
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white px-2 py-2"
            >
                <option value="">Select a reason</option>
                <option value="inappropriate">Inappropriate content</option>
                <option value="spam">Spam</option>
                <option value="copyright">Copyright violation</option>
                <option value="other">Other</option>
            </select>
            </div>
            <div>
            <label for="report-description" class="w-full block text-start text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
                id="report-description"
                v-model="description"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white px-2 py-2"
                placeholder="Please provide more details about the issue"
            ></textarea>
            </div>
        </div>
        <div class="mt-6 flex justify-end space-x-3">
            <Button @click="closeModal" variant="outline" type="button" class="py-4">
                  Cancel
                </Button>
                <Button type="submit" :disabled="!isFormValid" class="py-4">
                  Submit Report
                </Button>
        </div>
        </form>
    </div>
    </div>
  </template>
  
 
  <style scoped>
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }
  </style>
  
  