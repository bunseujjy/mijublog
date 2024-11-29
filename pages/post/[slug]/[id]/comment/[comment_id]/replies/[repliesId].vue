<script setup lang="ts">
import type { BlogData, Replies } from '~/lib/type'
import { useRoute } from 'vue-router'
import type { Database } from '~/supabase'
import type { User } from '@supabase/supabase-js'
import type { Comment } from '~/lib/type'
import { postReply } from '~/server/comments/postReply'

const client = useSupabaseClient()
const route = useRoute()
const comment_id = computed(() => route.params.comment_id)
const replies_id = computed(() => route.params.repliesId)
const post_id = computed(() => route.params.id)
const currentUser = ref()
const users = ref<User[]>([])
const comment = ref<Comment | null>(null)
const replies = ref<Replies[]>([])
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

const addReply = async (commentId: string, replyText: string, parentReplyId: string | null) => {
  const reply = await postReply(
    blog_db.value?.id as string,
    comment_id.value as string,
    currentUser.value.id,
    replyText,
    parentReplyId
  );
  return reply
};

const getCommentData = async () => {
    const { data, error } = await client
        .from('comments')
        .select('*')
        .eq('id', comment_id.value)
        .single();
    if (error) {
        console.error('Error fetching comment data:', error.message);
        isError.value = true;
    }
    if (data) {
        comment.value = data;
    }
};

const getRepliesData = async () => {
  const { data, error } = await client
    .from('replies')
    .select('*') // Fetch all relevant columns
    .or(`id.eq.${replies_id.value},parent_reply_id.eq.${replies_id.value}`); // Combine conditions with `or`

  if (error) {
    console.error('Error fetching replies:', error.message);
    isError.value = true;
    return;
  }

  if (data) {
    replies.value = [...data];
  }
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

const replyTree = computed(() => {
    const tree: { [key: string]: Replies[] } = { root: [] };
    replies.value.forEach(reply => {
        const parentId = reply.parent_reply_id || 'root';
        if (!tree[parentId]) {
            tree[parentId] = [];
        }
        tree[parentId].push(reply);
    });
    Object.keys(tree).forEach(key => {
        tree[key].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });
    return tree;
});

const filteredReplies = computed(() => {
  return replies.value.filter(reply => {
    if (!reply.parent_reply_id) {
      // Include root replies
      return true;
    }
    // Include replies where the parent_reply_id is unique in the replies list
    return !replies.value.some(
      otherReply =>
        otherReply.id !== reply.id && otherReply.parent_reply_id === reply.parent_reply_id
    );
  });
});

const toggleAction = (id: string, action: 'share' | 'more' | 'report' | 'edit') => {
    // First, close all other toggles
    const stateRef = action === 'share' ? isOpen : action === 'more' ? isOpenMore : action === 'report' ? isOpenReport : isOpenEdit;
    for (const commentId in stateRef.value) {
      if (commentId !== id) {
        stateRef.value[commentId] = false;
      }
    }
    // Toggle the current comment
    stateRef.value[id] = !stateRef.value[id];
  };

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
    await getCommentData()
    await getRepliesData()
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
    <template v-else-if="filteredReplies && blog_db">
      <!-- Link back to the blog post -->
      <NuxtLink 
        :to="`/post/@${authorDetails?.user_metadata.username}/${blog_db.id}`"
        class="text-blue-500 hover:underline mb-6 inline-block"
      >
        ← Back to post
      </NuxtLink>
      <h1 class="text-black dark:text-white text-2xl font-bold mb-6">Comment Thread</h1>
      <!-- Render filtered replies -->
      <div v-for="reply in filteredReplies" :key="reply.id" :id="reply.id">
        <NestedComment 
          :comment="reply" 
          :reply="reply" 
          :currentUser="currentUser" 
          :users="users"
          :replyTree="replyTree" 
          @reply="addReply" 
          @toggleAction="toggleAction" 
          :isOpen="isOpen" 
          :isOpenMore="isOpenMore"
          :isOpenEdit="isOpenEdit"
          :isOpenReport="isOpenReport"
          :blog_db="blog_db"
        />
      </div>
    </template>
    <div v-else class="text-center text-black dark:text-white">
      <p>Comment not found</p>
    </div>
  </div>
</template>
