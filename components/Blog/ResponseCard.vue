<script setup lang="ts">
import { ref } from 'vue';
import { Eraser, GripVerticalIcon, Heart, Link2, PencilLine } from 'lucide-vue-next';
import { formatDateToNow } from '~/lib/formattedDate';
import type { Comment, Replies } from '~/lib/type';
import { useToast } from '../ui/toast';
import type { User } from '@supabase/supabase-js';
import { deleteComment } from '~/server/comments/deleteComment';

interface ResponseCardProps {
  response: Comment | null;
  reply: Replies | null;
  author: User | undefined;
}
const props = defineProps<ResponseCardProps>();
const { toast } = useToast();

const isEdit = ref<Record<string, boolean>>({});
const dropdownState = ref<Record<string, boolean>>({}); // Keep track of dropdown state for each comment

const linkToCopy = computed(() => {
  if(props.response?.id) {
    return `${window.location.host}/post/@${props.author?.user_metadata?.username}/${props.response?.post_id || props.reply?.post_id}/comment/${props.response?.id}`
  } else if(props.reply?.id) {
    return `${window.location.host}/post/@${props.author?.user_metadata?.username}/${props.response?.post_id || props.reply?.post_id}/comment/${props.reply.comment_id}/replies/${props.reply?.id}`
  }
})

const copyLink = async () => {
  await navigator.clipboard.writeText(linkToCopy.value ?? '');
  toast({ description: 'Link copied to clipboard' });
};

const toggleEdit = () => {
  isEdit.value[props.response?.id || props.reply?.id || ''] = !isEdit.value[props.response?.id || props.reply?.id || ''];
  dropdownState.value[props.response?.id || props.reply?.id || ''] =  !dropdownState.value[props.response?.id || props.reply?.id || '']; // Close dropdown when toggling edit
};

const handleClickOutside = () => {
  isEdit.value[props.response?.id || props.reply?.id || ''] = false;
  dropdownState.value[props.response?.id || props.reply?.id || ''] = false;
}

const handleDelete = async () => {
  try {
    if(props.response?.id) {
      await deleteComment(props.response.id, null)
    } else if(props.reply?.id) {
      await deleteComment(null, props.reply.id)
    }
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div class="flex flex-col md:flex-row items-start md:items-center justify-between">
    <div class="text-black dark:text-white flex-grow space-y-2">
      <span class="text-xs text-gray-500 dark:text-gray-400">
        <span>{{ props.response ? '(Comment)' : '(Reply)' }}</span>
      </span>
      <div class="relative flex items-center justify-between">
        <NuxtLink :to="`/post/@${author?.user_metadata?.username}/${response?.post_id}/comment/${response?.id}`"
                  class="text-md text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {{ response?.content || reply?.content}}
        </NuxtLink>
        <div class="flex items-center justify-between space-x-2">
          <button
            class="inline-flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <Heart class="w-4 h-4" />
            <span class="text-xs pl-2">{{ response?.likes_count || reply?.likes_count}}</span>
          </button>
          <button type="button"
                  class="inline-flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  @click="copyLink">
            <Link2 />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <GripVerticalIcon class="w-4 h-4 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-48 dark:bg-gray-800 dark:text-white dark:border-muted-foreground">
              <DropdownMenuGroup>
                <DropdownMenuItem class="cursor-pointer" @click="toggleEdit">
                  <PencilLine /> Edit Response
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="ml-2 cursor-pointer" asChild>
                  <AlertDeleteDialog title="Response" :response="props.response" :reply="props.reply" @handleDelete="handleDelete">
                  <template #icon>
                    <Eraser />
                  </template>
                  </AlertDeleteDialog>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div v-show="isEdit[response?.id || reply?.id || '']">
            <EditResponseModal :response="response" :reply="reply" :isEdit="isEdit" @close="toggleEdit" :author="author" @handleClickOutside="handleClickOutside"/>
          </div>
        </div>
      </div>
      <div class="text-black dark:text-muted">
        <p class="text-xs md:text-sm">Posted at <span>{{ formatDateToNow(response?.updated_at || reply?.updated_at) }}</span></p>
      </div>
    </div>
  </div>
</template>
