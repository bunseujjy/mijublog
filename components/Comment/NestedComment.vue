<script setup lang="ts">
const props = defineProps<{
  comment: Comment,
  currentUser: User,
  reply: Replies,
  blog_db: BlogData
  replyTree: { [key: string]: Replies[] },
  users: User[],
  isOpen: Record<string, boolean>,
  isOpenMore: Record<string, boolean>,
  isOpenEdit: Record<string, boolean>,
  isOpenReport: Record<string, boolean>,
}>();

import { Icon } from '#components'
import type { User } from '@supabase/supabase-js';
import { CircleMinus, CirclePlus, Ellipsis, Eraser, FilePenLine, Link, MessageCircleWarning } from 'lucide-vue-next';
import { type Replies, type Comment, type BlogData } from '~/lib/type';
import { likeReplies } from '~/server/comments/likeReplies';
import * as pkg from "vue-toastification"
import { deleteComment } from '~/server/comments/deleteComment';
const { useToast } = pkg as any

const emit = defineEmits(['reply', 'toggleAction', 'closeModalIfOutsideClick', 'handleDeletingReply']);
const client = useSupabaseClient()
const route = useRoute();
const toast = useToast()
const isReplying = ref(false);
const isExpanded = ref(true);
const replyText = ref('');
const ownerOfReplies = ref<any>()
const shareRef = ref<HTMLElement | null>(null);
const moreRef = ref<HTMLElement | null>(null);
const editRef = ref<HTMLElement | null>(null);
const reportRef = ref<HTMLElement | null>(null);

const submitReply = () => {
  if (replyText.value.trim()) {
    const parentId = props.reply.parent_reply_id ? props.reply.parent_reply_id : props.reply.id;
    emit('reply', props.comment.id, replyText.value.trim(), parentId);
    replyText.value = '';
    isReplying.value = false;
  }
};

const handleNestedReply = (commentId: string, content: string, parentReplyId: string) => {
  emit('reply', commentId, content, parentReplyId);
};

const cancelReply = () => {
  replyText.value = '';
  isReplying.value = false;
};

const toggleAction = (id: string, action: 'share' | 'more' | 'report' | 'edit') => {
  emit('toggleAction', id, action)
};

const handleLikeReply = async () => {
  await likeReplies(1, props.reply.id, props.currentUser.id);
};

const linkToCopy = computed(() => {
  const hasCommentInPath = route.path.includes('/comment');
  if(hasCommentInPath) {
    return `${window.location.origin}${route.path}/replies/${props.reply.id}`;
  } else {
    return `${window.location.origin}${route.path}/comment/${props.comment.id}/replies/${props.reply.id}`;
  }
});

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(linkToCopy.value);
    toast.success('Link copied')
  } catch (error) {
    console.error("Failed to copy link:", error);
  }
};

const childReplies = computed(() => {
  return props.replyTree[props.reply.id] || [];
});

const hasChildReplies = computed(() => {
  return childReplies.value.length > 0;
});

const isSecondLevel = computed(() => {
  return props.reply.parent_reply_id !== null;
});

const closeModalIfOutsideClick = (event: MouseEvent) => {
  const isClickInsideModals = [shareRef, moreRef, editRef, reportRef].some(ref => 
    ref.value && ref.value.contains(event.target as Node)
  );

  if (!isClickInsideModals) {
    if (props.isOpen[props.reply.id]) {
      toggleAction(props.reply.id, 'share');
    }
    if (props.isOpenMore[props.reply.id]) {
      toggleAction(props.reply.id, 'more');
    }
    if (props.isOpenEdit[props.reply.id]) {
      toggleAction(props.reply.id, 'edit');
    }
    if (props.isOpenReport[props.reply.id]) {
      toggleAction(props.reply.id, 'report');
    }
  }
};

const handleDeletingReply = (replyId: string) => {
  emit('handleDeletingReply', replyId);
};

watchEffect(() => {
  if (props.users.length > 0 && props.reply) {
    ownerOfReplies.value = props.users.find((u) => props.reply.user_id === u.id)
  }
})

onMounted(() => {
  // Subscribe to reply updates
  client
    .channel(`reply-${props.reply.id}`)
    .on(
      'postgres_changes',
      { 
        event: '*',
        schema: 'public',
        table: 'replies',
        filter: `id=eq.${props.reply.id}`
      },
      (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        if (eventType === 'UPDATE' && newRecord) {
          // Update the reply properties while preserving reactivity
          Object.keys(newRecord).forEach(key => {
            if (props.reply.hasOwnProperty(key)) {
              (props.reply as {[k in string]: any})[key] = newRecord[key];
            }
          });
        } else if(eventType === 'DELETE' && oldRecord) {
          handleDeletingReply(oldRecord.id);
        }
      }
    )
    .subscribe();

  document.addEventListener('click', closeModalIfOutsideClick);
});

onBeforeUnmount(() => {
  client.channel(`reply-${props.reply.id}`).unsubscribe();
  document.removeEventListener('click', closeModalIfOutsideClick);
});
</script>

<template>
  <div class="comment-thread relative" :class="{ 'ml-14': isSecondLevel }" :id="reply.id">
    <div :class="['flex', {'my-7' : hasChildReplies}]">
      <div class="mr-3 flex flex-col items-center relative">
        <NuxtImg :src="ownerOfReplies?.user_metadata?.profile_url" alt="profile" class="size-[40px] bg-blue-500 rounded-full" />
        <div v-if="hasChildReplies" class="threadline-container absolute left-5 top-[52px] h-full" :style="{ height: childReplies.length }">
          <div class="absolute w-[1px] bg-white/20 h-[90%]"></div>
          <div class="absolute left-0 top-5 w-5 h-8">
            <div class="absolute w-full h-full border-b-[1px] border-white/20 rounded-bl-[12px]"></div>
          </div>
          <div class="absolute left-6 top-11">
            <button @click="isExpanded = !isExpanded">
              <template v-if="!isExpanded">
                <CirclePlus class="text-white/80" :size="16" />
                {{ childReplies.length }} more replies
              </template>
              <p class="text-white text-xs absolute top-0 -right-18 w-[120px]" v-if="!isExpanded">{{ childReplies.length }} more replies</p>
              <template v-else>
                <CircleMinus class="text-white/80" :size="16" />
              </template>
            </button>
          </div>
        </div>
      </div>
      <div class="flex-grow">
        <div class="rounded-lg">
          <div class="font-bold text-black dark:text-white">
            {{ ownerOfReplies?.user_metadata?.username }}
          </div>
          <p class="text-black dark:text-white mt-1">{{ reply?.content }}</p>
          <div class="text-black dark:text-white mt-0.5 mb-3 flex space-x-4">
            <button class="flex items-center cursor-pointer" @click="handleLikeReply">
              <Icon name="mingcute:thumb-up-2-line" />
              <span>{{ reply.likes_count }}</span>
            </button>
            <button @click="isReplying = !isReplying" class="flex items-center text-sm focus:outline-none">
              <Icon name="mingcute:chat-3-line" />
              Reply
            </button>
            <div class="relative" ref="shareRef">
              <div class="flex items-center space-x-2 cursor-pointer" @click.stop="toggleAction(reply.id, 'share')">
                <Icon name="mingcute:share-2-line"/>
                <span class="text-black dark:text-white">Share</span>
              </div>
              <div v-if="isOpen[reply.id]" class="flex items-center min-w-[170px] absolute -left-1 text-white bg-[#13181e] hover:opacity-80 transform duration-300 rounded-md px-4 py-2 z-50">
                <button type="button" class="flex items-center space-x-2" @click="copyLink"><Link /> <span class="w-full">Copy Link</span></button>
              </div>
            </div>
            <div class="relative" ref="moreRef">
              <div class="flex items-center space-x-2 cursor-pointer" @click.stop="toggleAction(reply.id, 'more')">
                <Ellipsis />
              </div>
              <div v-if="isOpenMore[reply.id]" class="flex flex-col items-start min-w-[170px] absolute -left-1 text-white bg-[#13181e] rounded-md px-4 py-2 space-y-3 z-50" ref="editRef">
                <button type="button" class="flex items-center space-x-2" @click.stop="toggleAction(reply.id, 'report')"><MessageCircleWarning /> <span class="w-full hover:opacity-80 transform duration-300">Report </span></button>
                <button type="button" class="flex items-center space-x-2" v-show="ownerOfReplies.id === currentUser.id" @click.stop="toggleAction(reply.id, 'edit')"><FilePenLine /> <span class="w-full hover:opacity-80 transform duration-300">Edit </span></button>
                <button type="button" class="flex items-center space-x-2" v-show="ownerOfReplies.id === currentUser.id" @click="deleteComment(null, reply.id)"><Eraser /> <span class="w-full hover:opacity-80 transform duration-300">Delete </span></button>
              </div>
              <div v-show="isOpenReport[reply.id]" ref="reportRef">
                <ReportModal :isOpenReport="isOpenReport" @toggleAction="toggleAction" :comment="comment" :reply="reply" :currentUser="currentUser" :blog_db="blog_db"/>
              </div>
              <div v-show="isOpenEdit[reply.id]">
                <EditingModal :isOpenEdit="isOpenEdit" @toggleAction="toggleAction" :comment="comment" :reply="reply" :currentUser="currentUser" :blog_db="blog_db"/>
              </div>
            </div>
          </div>

          <div v-if="isReplying" class="mt-2">
            <textarea v-model="replyText"
              class="w-full bg-transparent text-black dark:text-white border border-gray-300 p-4 rounded-xl"
              placeholder="Write a reply..." rows="2"></textarea>
            <div class="mt-2 flex justify-end space-x-2">
              <button @click="cancelReply"
                class="px-3 py-1 text-sm bg-gray-800 text-white hover:opacity-80 focus:outline-none rounded-full">
                Cancel
              </button>
              <button @click="submitReply"
                class="bg-muted-foreground text-white text-sm hover:opacity-70 transform duration-300 rounded-full px-4 py-2">
                Submit
              </button>
            </div>
          </div>
        </div>

        <div v-if="isExpanded && hasChildReplies" class="mt-4 space-y-4">
          <div v-for="childReply in childReplies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())" :key="childReply.id">
            <NestedComment 
              :comment="comment" 
              :reply="childReply" 
              :currentUser="currentUser" 
              :users="users"
              :replyTree="replyTree" 
              @reply="handleNestedReply" 
              :isOpen="isOpen" 
              @toggleAction="toggleAction" 
              :isOpenMore="isOpenMore"
              :isOpenEdit="isOpenEdit"
              :isOpenReport="isOpenReport"
              :blog_db="blog_db"
              @closeModalIfOutsideClick="closeModalIfOutsideClick"
              @handleDeletingReply="handleDeletingReply"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>