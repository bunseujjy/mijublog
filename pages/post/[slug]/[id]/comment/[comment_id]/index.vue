<script setup lang="ts">
import type { BlogData, Comment, CommentResponse } from '~/lib/type'
import { useRoute } from 'vue-router'
import type { Database } from '~/supabase'
import type { User } from '@supabase/supabase-js'
import { postReply } from '~/server/comments/postReply'
import { getComment } from '~/server/comments/getComment'

const client = useSupabaseClient()
const route = useRoute()
const post_id = computed(() => route.params.id)
const comment_id = computed(() => route.params.comment_id)
const { user: currentUser } =useAuth();
const users = ref<User[]>([])
const comments = ref<CommentResponse>([])
const blog_db = ref<BlogData | null>(null)
const isLoading = ref(true)
const isError = ref(false)
const isOpen = ref<Record<string, boolean>>({})
const isOpenMore = ref<Record<string, boolean>>({})
const isOpenEdit = ref<Record<string, boolean>>({})
const isOpenReport = ref<Record<string, boolean>>({})
const shareRef = ref<HTMLElement | null>(null)
const moreRef = ref<HTMLElement | null>(null)
const editRef = ref<HTMLElement | null>(null)
const reportRef = ref<HTMLElement | null>(null)
const authorDetails = ref<User | null>(null)

const addReply = async (commentId: string, replyText: string, parentReplyId: string | null) => {
  const reply = await postReply(
    blog_db.value?.id ?? '',
    null,
    commentId,
    currentUser.value?.id ?? '',
    replyText,
    parentReplyId,
    'blog'
  )
  const newComments = await getComment(blog_db.value?.id ?? '', null)
  comments.value = newComments ?? []
  return reply
}

const getBlogData = async () => {
  const { data, error } = await client.from("blog_posts").select("*").eq("id", post_id.value)
  if (error) {
    console.error(error.message)
    return
  }
  blog_db.value = data?.[0] ?? null
}

const closeModalIfOutsideClick = (event: MouseEvent) => {
  if (
    (shareRef.value && !shareRef.value.contains(event.target as Node)) &&
    (moreRef.value && !moreRef.value.contains(event.target as Node)) &&
    (editRef.value && !editRef.value.contains(event.target as Node)) &&
    (reportRef.value && !reportRef.value.contains(event.target as Node))
  ) {
    Object.keys(isOpen.value).forEach((id) => {
      isOpen.value[id] = false
    })
    Object.keys(isOpenMore.value).forEach((id) => {
      isOpenMore.value[id] = false
    })
    Object.keys(isOpenEdit.value).forEach((id) => {
      isOpenEdit.value[id] = false
    })
    Object.keys(isOpenReport.value).forEach((id) => {
      isOpenReport.value[id] = false
    })
  }
}

watchEffect(() => {
  if (users.value.length > 0 && blog_db.value) {
    authorDetails.value = users.value.find((u) => blog_db.value?.author_id === u.id) ?? null
  }
})

onMounted(async () => {
  try {
    await getBlogData()
    const [user, cmt] = await Promise.all([
      getAllUser(),
      getComment(blog_db.value?.id ?? '', null)
    ])
    users.value = user ?? []
    comments.value = cmt ?? []
  } catch (err) {
    console.error('Failed to fetch data:', err)
    isError.value = true
  } finally {
    isLoading.value = false
  }
  document.addEventListener('click', closeModalIfOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeModalIfOutsideClick)
})

// Watch for route changes to keep `post_id` updated if the route changes
watch(() => route.params.id, (newId) => {
  route.params.id = newId
})

// Watch blog_db and update SEO metadata when it changes
watch(blog_db, (newBlog) => {
  if (newBlog) {
    useSeoMeta({
      title: `Comment | ${newBlog.title}`,
      ogTitle: `Comment | ${newBlog.title}`,
      ogImage: newBlog.featured_image_url || '/open-graph.png',
      ogDescription: newBlog.subtitle,
      description: newBlog.subtitle,
      ogUrl: `${import.meta.env.VITE_BASE_URL}${route.fullPath}`,
      twitterTitle: `Comment | ${newBlog.title}`,
      twitterDescription: `Comment | ${newBlog.subtitle}`,
      twitterImage: newBlog.featured_image_url || '/open-graph.png',
    })
  }
}, { immediate: true })
</script>

<template>
  <div class="max-w-[780px] mx-auto px-4 md:px-0 py-8">
    <div v-if="isLoading" class="flex justify-center items-center min-h-[200px] text-black dark:text-white">
      <p class="text-black dark:text-white">Loading...</p>
    </div>
    
    <div v-else-if="isError" class="text-center text-red-500">
      <p>Failed to load the comment thread</p>
    </div>
    
    <template v-else-if="comments.length !== 0 && blog_db">
      <NuxtLink 
        :to="`/post/@${authorDetails?.user_metadata?.username}/${blog_db.id}`"
        class="text-blue-500 hover:underline mb-6 inline-block"
      >
        ← Back to post
      </NuxtLink>
      
      <h1 class="text-2xl font-bold mb-6 text-black dark:text-white">Comment Thread</h1>
      
      <CommentThread
        v-for="comment in comments.filter((cmt) => cmt.id === comment_id)"
        :key="comment.id"
        :comment="comment"
        :currentUser="currentUser"
        :users="users"
        :blog_db="blog_db"
        :list_db="null"
        @reply="addReply" 
      />
    </template>
    
    <div v-else class="text-center text-black dark:text-white">
      <p>Comment not found</p>
    </div>
  </div>
</template>