<script setup lang="ts">
import { ref, watch } from 'vue';
import { XIcon } from 'lucide-vue-next';
import { useToast } from '../ui/toast';
import type { Comment, Replies } from '~/lib/type';
import { updatingComments, updatingReply } from '~/server/comments/updatingComments';
import type { User } from '@supabase/supabase-js';

interface EditResponseModalProps {
  isEdit: Record<string, boolean>;
  response: Comment | null;
  reply: Replies | null;
  author: User | undefined;
}

const props = defineProps<EditResponseModalProps>();
const emit = defineEmits(['close', 'save', 'handleClickOutside']);

const { toast } = useToast();
const editedContent = ref(props.response?.content || props.reply?.content);
const isLoading = ref(false);
const error = ref('');
const ignoreElRef = ref()

const handleClickOutside = [
  () => {
    emit('handleClickOutside')
  },
  { ignore: [ignoreElRef] },
]

watch(() => props.isEdit, (newValue) => {
  if (newValue) {
    editedContent.value = props.response?.content;
    error.value = '';
  }
});

const handleSave = async () => {
if(!editedContent?.value) {return null}
  if (editedContent.value.trim() === '') {
    error.value = 'Response content cannot be empty';
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    // Simulated API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if(props.response?.id) {
                await updatingComments(props.response?.id, editedContent.value, props.author?.id as string, props.response.post_id, props.response.list_id)
            } else if(props.reply?.id) {
                await updatingReply(editedContent.value, props.reply.id, props.author?.id as string, props.reply?.post_id, props.reply.list_id)
            }
    toast({ description: 'Response updated successfully' });
    emit('close');
  } catch (err) {
    error.value = 'Failed to update response. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

</script>

<template>
  <Transition appear :show="props.isEdit" name="fade"  v-click-outside="handleClickOutside" >
    <div class="relative z-10">
      <div class="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-50" />

      <div class="fixed inset-0 overflow-y-auto" ref="ignoreElRef">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <Transition name="scale">
            <div class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
              <div class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                Edit Response
              </div>
              <button
                @click="emit('close')"
                class="absolute top-2 right-2 text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
              >
                <XIcon class="w-6 h-6" />
              </button>
              <div class="mt-4">
                <textarea
                  v-model="editedContent"
                  rows="4"
                  class="w-full px-3 py-2 text-gray-700 dark:text-gray-300 border rounded-lg focus:outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  placeholder="Edit your response..."
                ></textarea>
                <p v-if="error" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
              </div>
              <div class="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                  @click="emit('close')"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  @click="handleSave"
                  :disabled="isLoading"
                >
                  {{ isLoading ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </Transition>
</template>
