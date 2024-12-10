<script setup lang="ts">
const props = defineProps<{
  comment: Comment,
  currentUser: User | null,
  blog_db: BlogData
  users: User[]
}>();

import { Icon } from '#components'
import type { User } from '@supabase/supabase-js';
import { CircleMinus, CirclePlus, Ellipsis, Eraser, FilePenLine, Link, MessageCircleWarning, X } from 'lucide-vue-next';
import { type Replies, type Comment, type BlogData} from '~/lib/type';
import { deleteComment } from '~/server/comments/deleteComment';
import { getReplies } from '~/server/comments/getReplies';
import { likeComment } from '~/server/comments/likeComment';
import { useToast } from '../ui/toast';

const emit = defineEmits(['reply', 'handleDeletingCmt']);
const client = useSupabaseClient()
const route = useRoute();
const {toast} = useToast()
const isReplying = ref(false);
const isExpanded = ref(true);
const replyText = ref('');
const replies = ref<Replies[]>([]);
const ownerOfReplies = ref<any>()
const isOpen = ref<Record<string, boolean>>({});
const isOpenMore = ref<Record<string, boolean>>({});
const isOpenEdit = ref<Record<string, boolean>>({});
const isOpenReport = ref<Record<string, boolean>>({});
const shareRef = ref<HTMLElement | null>(null);
const moreRef = ref<HTMLElement | null>(null);
const editRef = ref<HTMLElement | null>(null);
const reportRef = ref<HTMLElement | null>(null);
const reply = ref<Replies | any>({});
const ignoreElRef = ref();

const onClickOutsideHandler = [
  (event: any) => {
    const isClickInsideModals = [shareRef, moreRef, editRef, reportRef].some(ref => 
    ref.value && ref.value.contains(event.target as Node)
  );
  if (!isClickInsideModals) {
    if (isOpen.value[props.comment.id]) {
      toggleAction(props.comment.id, 'share');
    }
    if (isOpenMore.value[props.comment.id]) {
      toggleAction(props.comment.id, 'more');
    }
    if (isOpenEdit.value[props.comment.id]) {
      toggleAction(props.comment.id, 'edit');
    }
    if (isOpenReport.value[props.comment.id]) {
      toggleAction(props.comment.id, 'report');
    }
  }
  },
  { ignore: [ignoreElRef] },
]

const submitReply = () => {
  if (replyText.value.trim()) {
    emit('reply', props.comment.id, replyText.value.trim(), null);
    replyText.value = '';
    isReplying.value = false;
  }
};

const handleNestedReply = (commentId: string, content: string, parentReplyId: string) => {
  emit('reply', props.comment.id, content, parentReplyId);
};

const cancelReply = () => {
  replyText.value = '';
  isReplying.value = false;
};

const replyTree = computed(() => {
  const tree: { [key: string]: Replies[] } = {
    root: []
  };

  replies.value.forEach(reply => {
    const parentId = reply.parent_reply_id || 'root';
    if (!tree[parentId]) {
      tree[parentId] = [];
    }
    tree[parentId].push(reply);
  });

  return tree;
});

const toggleAction = (id: string, action: 'share' | 'more' | 'report' | 'edit') => {
  const stateRef = action === 'share' ? isOpen : action === 'more' ? isOpenMore : action === 'report' ? isOpenReport : isOpenEdit;
  for (const commentId in stateRef.value) {
    if (commentId !== id) {
      stateRef.value[commentId] = false;
    }
  }
  stateRef.value[id] = !stateRef.value[id];
};

const linkToCopy = computed(() => {
  return `${window.location.origin}${route.path}/comment/${props.comment.id}`;
});

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(linkToCopy.value);
    toast({description: 'Link copied'})
  } catch (error) {
    console.error("Failed to copy link:", error);
  }
};

const handleLikeComment = async () => {
  await likeComment(1, props.comment.id, props.currentUser?.id as string);
};

const updateReplies = async () => {
  const updatedReplies = await getReplies(props.comment?.id);
  if (updatedReplies) {
    replies.value = updatedReplies;
  }
};

const handleDeletingReply = (replyId: string) => {
  // Remove the deleted reply and all its nested replies
  const removeReplyAndChildren = (replyId: string) => {
    // Find and remove the direct reply
    replies.value = replies.value.filter(r => r.id !== replyId);
    
    // Find and remove all nested replies that have this reply as a parent
    const nestedReplies = replies.value.filter(r => r.parent_reply_id === replyId);
    nestedReplies.forEach(nested => {
      removeReplyAndChildren(nested.id);
    });
  };
  removeReplyAndChildren(replyId);
};


watchEffect(() => {
  if (props.users.length > 0 && props.comment) {
    ownerOfReplies.value = props.users.find((u) => props.comment.user_id === u.id)
  }
})

onMounted(async () => {
  await updateReplies();
  // Subscribe to comment updates
  client
    .channel(`comment-${props.comment.id}`)
    .on(
      'postgres_changes',
      { 
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `id=eq.${props.comment.id}`
      },
      (payload) => {
        const { eventType, new: newRecord } = payload;
        if (eventType === 'UPDATE' && newRecord) {
          // Update the comment properties while preserving reactivity
          Object.keys(newRecord).forEach((key) => {
            if (props.comment.hasOwnProperty(key)) {
              (props.comment as { [k in string]: any})[key]= newRecord[key];
            }
          });
        } else if(eventType === 'DELETE' && newRecord) {
          emit('handleDeletingCmt', props.comment.id)
        }
      }
    )
    .subscribe();

  // Subscribe to replies updates
  client
    .channel(`replies-${props.comment.id}`)
    .on(
      'postgres_changes',
      { 
        event: '*',
        schema: 'public',
        table: 'replies',
        filter: `comment_id=eq.${props.comment.id}`
      },
      async (payload) => {
        const { eventType, old: oldRecord } = payload;
        if (eventType === 'DELETE' && oldRecord) {
          handleDeletingReply(oldRecord.id);
        } else {
          // For other events (INSERT, UPDATE), refresh all replies
          await updateReplies();
        }
      }
    )
    .subscribe();
});

onBeforeUnmount(() => {
  client.channel(`comment-${props.comment.id}`).unsubscribe();
  client.channel(`replies-${props.comment.id}`).unsubscribe();
});
</script>

<template>
  <div :class="['comment-thread relative', {'mb-8' : replies.length > 0}]" :id="comment.id" v-click-outside="onClickOutsideHandler" ref="ignoreElRef">
    <div :class="['flex', {'mt-5' : replies.length > 0}]">
      <div class="mr-3 flex flex-col items-center relative">
        <NuxtImg :src="ownerOfReplies?.user_metadata?.profile_url" alt="profile"
          class="w-10 h-10 bg-blue-500 rounded-full" />

        <div v-if="replies.length > 0" class="threadline flex items-end justify-end align-start relative bg-neutral-background mt-2" :style="{ height: `${replies.length * 100}%` }">
          <div
            class="box-border h-full border-0 border-white/20 border-solid border-b-[1px] cursor-pointer w-[calc(50%+0.5px)] border-l-[1px] rounded-bl-[12px] flex items-end justify-end">
            <div class="flex items-end relative -right-6 top-3">
              <div v-if="isExpanded">
                <CirclePlus class="text-white align-bottom" :size="20" />
              </div>
              <div v-else @click="isExpanded = !isExpanded">
                <CircleMinus  class="text-white align-bottom" :size="20"/>
              </div>
              <p class="text-white text-xs absolute -right-32 w-[120px]" v-if="isExpanded" @click="isExpanded = !isExpanded">{{ replies.length }} more replies</p>
            </div>
          </div>
          <div
            class="box-border h-full border-0 border-white border-solid border-b-[1px] cursor-pointer absolute right-[-8px]">
          </div>
        </div>
      </div>
      <div class="flex-grow">
        <div class="rounded-lg shadow">
          <div class="font-bold text-black dark:text-white">
            {{ ownerOfReplies?.user_metadata?.username }}
          </div>
          <p class="text-black dark:text-white mt-1">{{ comment?.content }}</p>
          <div :class="['text-black dark:text-white mt-0.5 flex space-x-4', {'mb-3': isExpanded}]">
            <button class="flex items-center cursor-pointer" @click="handleLikeComment">
              <Icon name="mingcute:thumb-up-2-line" />
              <span>{{ comment.likes_count }}</span>
            </button>
            <button @click="isReplying = !isReplying" class="flex items-center text-sm focus:outline-none">
              <Icon name="mingcute:chat-3-line"/>
              Reply
            </button>
            <div class="relative" ref="shareRef">
              <div class="flex items-center space-x-2 cursor-pointer" @click="toggleAction(comment.id, 'share')">
                <Icon name="mingcute:share-2-line"/>
                <span class="text-black dark:text-white">Share</span>
              </div>
              <div v-if="isOpen[comment.id]" class="flex items-center min-w-[170px] absolute -left-1 text-white bg-[#13181e] hover:opacity-80 transform duration-300 rounded-md px-4 py-2 z-50">
                <button type="button" class="flex items-center space-x-2" @click="copyLink"><Link /> <span class="w-full">Copy Link</span></button>
              </div>
            </div>
            <div class="relative" ref="moreRef">
              <div class="flex items-center space-x-2 cursor-pointer" @click="toggleAction(comment.id, 'more')">
                <Ellipsis />
              </div>
              <div v-if="isOpenMore[comment.id]" class="flex flex-col items-start min-w-[170px] absolute -left-1 text-white bg-[#13181e] rounded-md px-4 py-2 space-y-3 z-50" ref="editRef">
                <button type="button" class="flex items-center space-x-2" @click.stop="toggleAction(comment.id, 'report')"><MessageCircleWarning /> <span class="w-full hover:opacity-80 transform duration-300">Report </span></button>
                <button type="button" class="flex items-center space-x-2" v-show="ownerOfReplies.id === currentUser?.id" @click.stop="toggleAction(comment.id, 'edit')"><FilePenLine /> <span class="w-full hover:opacity-80 transform duration-300">Edit </span></button>
                <button type="button" class="flex items-center space-x-2" v-show="ownerOfReplies.id === currentUser?.id" @click="deleteComment(comment.id, null)"><Eraser  /> <span class="w-full hover:opacity-80 transform duration-300">Delete </span></button>
              </div>
              <div v-show="isOpenReport[comment.id]" ref="reportRef">
                <ReportModal :isOpenReport="isOpenReport" @toggleAction="toggleAction" :comment="comment" :reply="reply" :currentUser="currentUser" :blog_db="blog_db"/>
              </div>
              <div v-show="isOpenEdit[comment.id]">
                <EditingCommentModal :isOpenEdit="isOpenEdit" @toggleAction="toggleAction" :comment="comment" :reply="null" :currentUser="currentUser" :blog_db="blog_db"/>
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
        <div v-if="!isExpanded && replies?.length > 0" class="mt-4 space-y-4 relative">
          <div v-for="reply in replyTree.root.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())" :key="reply.id" :id="reply.id">
            <NestedComment 
              :comment="comment" 
              :reply="reply" 
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
              @handleDeletingReply="handleDeletingReply"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>