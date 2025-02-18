<script setup lang="ts">
import type { User } from '@supabase/supabase-js';
import { ref } from 'vue';
import {  type Comment, type BlogData, type Lists } from '~/lib/type';
import { getComment } from '~/server/comments/getComment';
import { postComment } from '~/server/comments/postComment';
import { postReply } from '~/server/comments/postReply';
import type { Database } from '~/supabase';

const props = defineProps<{
  blog_db: BlogData | null,
  list_db: Lists | null,
  currentUser: User | null,
  users: User[],
  type: string
}>();
const client = useSupabaseClient()
const comments = ref<Comment[]>([]);
const newCommentText = ref<string>("");
const cmtLoading = ref(false)
let ownerOfComment = ref<any>(null)

const addComment = async () => {
  if (newCommentText.value.trim()) {
    cmtLoading.value = true
    try {
      const comment: Comment | any = await postComment(props.currentUser?.id as string, newCommentText.value, props.blog_db?.id || null, props.list_db?.id || null, props.type);
      // Check if comment is an array and handle accordingly
      if (Array.isArray(comment)) {
        const newComment = comment[0]; // Take the first comment if it's an array
        if (newComment && !comments.value.some((c: any) => c.id === newComment.id)) {
          comments.value = [...comments.value, newComment];
        }
      } else if (comment && !comments.value.some((c: any) => c.id === comment.id)) {
        comments.value = [...comments.value, comment];
      }
      newCommentText.value = '';
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      cmtLoading.value = false;
    }
  }
};

const addReply = async (commentId: string, replyText: string, parentReplyId: string | null) => {
  try {
    const reply = await postReply(
      props.blog_db?.id || null,
      props.list_db?.id || null,
      commentId,
      props.currentUser?.id as string,
      replyText,
      parentReplyId,
      props.type
    );
    // Refresh the comments to show the new reply
    const updatedComments = await getComment(props.blog_db?.id ?? '', props.list_db?.id ?? '');
    if (updatedComments) {
      comments.value = Array.isArray(updatedComments) ? updatedComments : [updatedComments];
    }
    return reply;
  } catch (error) {
    console.error('Error adding reply:', error);
    return null;
  }
};

const updateComments = async () => {
  try {
    const updatedComments = await getComment(props.blog_db?.id ?? '', props.list_db?.id ?? '');
    if (updatedComments) {
      comments.value = Array.isArray(updatedComments) ? updatedComments : [updatedComments];
    }
  } catch (error) {
    console.error('Error updating comments:', error);
  }
};

const handleDeletingCmt = (commentId: string) => {
  comments.value = comments.value.filter((c) => c.id !== commentId)
}

watchEffect(() => {
  if (props.users.length > 0 && comments.value) {
    ownerOfComment.value = props.users.find((u) => comments.value.some((c: any) => c.user_id === u.id));
  }
});

onMounted(async () => {
  await updateComments();
  
  // Subscribe to all changes on comments table
  client
    .channel("comments")
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'comments',
        filter: `blog_id=eq.${props.blog_db?.id}`
      },
      async (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        if (eventType === 'INSERT') {
          // Handle array or single comment
          const newComment = Array.isArray(newRecord) ? newRecord[0] : newRecord;
          if (newComment && newComment.content && !comments.value.some((c: any) => c.id === newComment.id)) {
            comments.value = [...comments.value, newComment];
          }
        } else if (eventType === 'UPDATE') {
          // Handle array or single comment
          const updatedComment = Array.isArray(newRecord) ? newRecord[0] : newRecord;
          if (updatedComment && updatedComment.content) {
            comments.value = comments.value.map((comment: any) => 
              comment.id === updatedComment.id ? { ...comment, ...updatedComment } : comment
            );
          }
        } else if (eventType === 'DELETE') {
          const deletedComment = Array.isArray(oldRecord) ? oldRecord[0] : oldRecord;
          if (deletedComment) {
            comments.value = comments.value.filter((c: any) => c.id !== deletedComment.id);
          }
        }
      }
    )
    .subscribe();
});

onBeforeUnmount(() => {
  client.channel("comments").unsubscribe();
});
</script>

<template>
  <div id="comment" class="py-6 pb-32 min-h-screen">
    <h1 class="text-3xl font-bold mb-6 text-gray-800 dark:text-muted">Discussion</h1>
    <div class="mb-6">
      <textarea
        v-model="newCommentText"
        class="w-full bg-transparent text-black dark:text-white border border-gray-300 p-4 rounded-xl"
        placeholder="Add a comment..."
        rows="3"
      ></textarea>
      <button
        @click="addComment"
        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Add Comment
      </button>
    </div>
    <div class="space-y-4">
      <CommentLoading v-if="cmtLoading" :comments="comments" :reply="[]"/>
      <CommentThread v-else
        v-for="comment in comments.filter((data) => data.type  === props.type)"
        :key="comment.id"
        :comment="comment"
        :currentUser="currentUser"
        :users="users"
        :blog_db="blog_db"
        :list_db="list_db"
        @reply="addReply"
        @handleDeletingCmt="handleDeletingCmt"
      />
    </div>
  </div>
</template>