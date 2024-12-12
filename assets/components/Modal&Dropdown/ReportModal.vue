<script setup lang="ts">
  import type { User } from '@supabase/supabase-js';
  import type { BlogData, Comment, Replies } from '~/lib/type';
  import emailReporting from '~/server/app/emailReporting';


  const props = defineProps<{
    isOpenReport: Record<string, boolean>,
    comment: Comment,
    reply: Replies,
    currentUser: User | null,
    blog_db: BlogData
  }>()

  const emit = defineEmits(['toggleAction', 'submit'])

  const reason = ref('')
  const details = ref('')

  const toggleAction = (id: string, action: 'share' | 'edit' | 'report') => {
    emit('toggleAction', id, action)
    resetForm()
  }

  const submitReport = async () => {
    if (reason.value) {
      try {
        await emailReporting(
          props.comment.id || props.reply.id,
          props.currentUser?.id as string,
          reason.value,
          details.value,
          props.currentUser?.user_metadata.email,
          props.currentUser?.user_metadata.username,
          props.blog_db.title
        );
        resetForm();
      } catch (error) {
        console.error('Failed to submit report:', error);
        // Handle error appropriately
      }
    }
  }
  const resetForm = () => {
    reason.value = ''
    details.value = ''
  }
</script>

<template>
  <div v-if="isOpenReport"
    class="fixed inset-0 text-black bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div class="p-6">
        <h2 class="text-2xl font-bold mb-4">Report Comment</h2>
        <form @submit.prevent="submitReport">
          <div class="mb-4">
            <label for="reason" class="block text-sm font-medium text-gray-700 mb-1">
              Reason for reporting
            </label>
            <select id="reason" v-model="reason"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required>
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="misinformation">Misinformation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="mb-4">
            <label for="details" class="block text-sm font-medium text-gray-700 mb-1">
              Additional details (optional)
            </label>
            <textarea id="details" v-model="details" rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please provide any additional information about your report..."></textarea>
          </div>
          <div class="flex justify-end space-x-3">
            <button type="button" @click="toggleAction(comment.id || reply.id, 'report')"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              Cancel
            </button>
            <button type="submit" :disabled="!reason"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>