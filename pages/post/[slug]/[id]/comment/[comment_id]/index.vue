<script setup lang="ts">
import type { BlogData } from '~/lib/type'
import { useRoute } from 'vue-router'
import type { Database } from '~/supabase'
import type { User } from '@supabase/supabase-js'
import type { Comment } from '~/lib/type'
import { postComment } from '~/server/post/postComment'
import { postReply } from '~/server/comments/postReply'
import { getComment } from '~/server/comments/getComment'

const client = useSupabaseClient()
const route = useRoute()
const comment_id = computed(() => route.params.comment_id)
const post_id = computed(() => route.params.id)
const currentUser = ref()
const users = ref<User[]>([])
const comments = ref()
const blog_db = ref<BlogData | null>(null)
const isLoading = ref(true)
const isError = ref(false)
const isOpen = ref<Record<string, boolean>>({});
const isOpenMore = ref<Record<string, boolean>>({});
const isOpenEdit = ref<Record<string, boolean>>({});
const isOpenReport = ref<Record<string, boolean>>({});
const shareRef = ref<HTMLElement | null>(null); // Reference to the modal
const moreRef = ref<HTMLElement | null>(null); // Reference to the modal
const editRef = ref<HTMLElement | null>(null); // Reference to the modal
const reportRef = ref<HTMLElement | null>(null); // Reference to the modal
let authorDetails = ref<any>(null);
const newCommentText = ref<string>("");

const addComment = async () => {
  if (newCommentText.value.trim()) {
    const comment = await postComment(currentUser.value?.id, newCommentText.value, blog_db.value?.id as any)
    comments.value.push(comment)
    newCommentText.value = '';
  }
};

const addReply = async (commentId: string, replyText: string, parentReplyId: string | null) => {
  const reply = await postReply(
    blog_db.value?.id as any,
    commentId,
    currentUser.value?.id,
    replyText,
    parentReplyId
  );
  // Refresh the comments to show the new reply
  comments.value = await getComment(blog_db.value?.id as any);
  return reply
};

const getBlogData = async () => {
    const { data, error } = await client.from("blog_posts").select("*").eq("id", post_id.value)
    if (error) {
        console.error(error.message)
    }
    // Ensure data is not empty before assigning to blog_db
    if (data && data.length > 0) {
        blog_db.value = data[0] // Get the first blog post since Supabase returns an array
    } else {
        blog_db.value = null // In case no data is found, you can handle the empty state here
    }
}

const closeModalIfOutsideClick = (event: MouseEvent) => {
  if (
    (shareRef.value && !shareRef.value.contains(event.target as Node)) &&
    (moreRef.value && !moreRef.value.contains(event.target as Node)) &&
    (editRef.value && !editRef.value.contains(event.target as Node)) &&
    (reportRef.value && !reportRef.value.contains(event.target as Node))
  ) {
    // If isOpen.value is an object, we can use Object.keys to iterate over its keys.
    Object.keys(isOpen.value).forEach((id) => {
      isOpen.value[id] = false;  // Close each modal
    });

    Object.keys(isOpenMore.value).forEach((id) => {
      isOpenMore.value[id] = false;  // Close each modal
    });
    Object.keys(isOpenEdit.value).forEach((id) => {
      isOpenEdit.value[id] = false;  // Close each modal
    });
    Object.keys(isOpenReport.value).forEach((id) => {
      isOpenReport.value[id] = false;  // Close each modal
    });
  }
};

watchEffect(() => {
    // Only compute authorDetails if user.value is populated and blog_db is available
    if (users.value.length > 0 && blog_db.value) {
      authorDetails.value = users.value.find((u) => {
        return blog_db.value?.author_id === u.id;
      });
    }
  });

onMounted(async () => {
  try {
    await getBlogData()
    await getCurrentUser(currentUser)
    const data = await getAllUser()
    
    if (data) {
      users.value = [...data]
    }
  } catch (err) {
    console.error('Failed to fetch data:', err)
    isError.value = true
  } finally {
    isLoading.value = false
  }
  document.addEventListener('click', closeModalIfOutsideClick);
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeModalIfOutsideClick);
});
</script>

<template>
  <div class="max-w-[780px] mx-auto px-4 md:px-0 py-8">
    <div v-if="isLoading" class="flex justify-center items-center min-h-[200px]">
      <p>Loading...</p>
    </div>
    
    <div v-else-if="isError" class="text-center text-red-500">
      <p>Failed to load the comment thread</p>
    </div>
    
    <template v-else-if="comments.length > 0 && blog_db">
      <!-- Link back to the blog post -->
      <NuxtLink 
        :to="`/post/@${authorDetails?.user_metadata.username}/${blog_db.id}`"
        class="text-blue-500 hover:underline mb-6 inline-block"
      >
        ← Back to post
      </NuxtLink>
      
      <h1 class="text-2xl font-bold mb-6">Comment Thread</h1>
      
      <!-- Reuse the CommentThread component -->
        <CommentThread
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :currentUser="currentUser"
          :users="users"
          :blog_db="blog_db"
          @reply="addReply" 
        />
    </template>
    
    <div v-else class="text-center text-black dark:text-white">
      <p>Comment not found</p>
    </div>
  </div>
</template>