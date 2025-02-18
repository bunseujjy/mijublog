<script setup lang="ts">
    import type { User } from '@supabase/supabase-js';
    import type { BlogData, Comment, Lists, Replies } from '~/lib/type';
    import { updatingComments, updatingReply } from '~/server/comments/updatingComments';

    const props = defineProps<{
        isOpenEdit: Record<string, boolean>,
        comment: Comment | null,
        reply: Replies | null,
        currentUser: User | null,
        blog_db: BlogData | null,
        list_db: Lists | null
    }>()

    const emit = defineEmits(['toggleAction'])
    const client = useSupabaseClient()
    const editedComment = ref(props.comment?.content || props.reply?.content)
    const isLoading = ref(false);
    const error = ref('');

    watch(() => props.comment?.content || props.reply?.content, (newValue) => {
        editedComment.value = newValue
    })

    const toggleAction = (id: string, action: 'share' | 'edit' | 'report') => {
        emit('toggleAction', id, action)
    }

    const saveComment = async () => {
        isLoading.value = true
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (editedComment.value && editedComment.value.trim()) {
                if(props.comment?.id) {
                    await updatingComments(props.comment?.id, editedComment.value, props.currentUser?.id as string, props.blog_db?.id ?? '', props.list_db?.id ?? '')
                } else if(props.reply?.id) {
                    await updatingReply(editedComment.value, props.reply?.id, props.currentUser?.id as string, props.blog_db?.id ?? '', props.list_db?.id ?? '')
                }
                props.isOpenEdit[props.comment?.id || props.reply?.id || ''] = false
            }
        } catch (err) {
            error.value = 'Failed to update response. Please try again.';
        } finally {
            isLoading.value = false;
        }
    }

    onMounted(() => {
        client.channel("comments").on('postgres_changes', { event: "UPDATE", schema: "public", table: "replies" },
            (payload) => {
                const { new: newRecord } = payload;
                // Check if the updated record matches the current blog post
                if (props.reply && props.reply.id === newRecord.id) {
                    props.reply.likes_count = newRecord.likes_count;
                }
            }).subscribe()
        client.channel("replies").on('postgres_changes', { event: "UPDATE", schema: "public", table: "replies" },
            (payload) => {
                const { new: newRecord } = payload;
                // Check if the updated record matches the current blog post
                if (props.reply && props.reply.id === newRecord.id) {
                    props.reply.likes_count = newRecord.likes_count;
                }
            }).subscribe()
    })

    onBeforeUnmount(() => {
        client.channel("comments").unsubscribe();
        client.channel("replies").unsubscribe();
    });
</script>

<template>
    <div v-if="isOpenEdit" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md" role="dialog"
            aria-labelledby="editCommentModalTitle">
            <div class="p-6">
                <h2 id="editCommentModalTitle" class="text-black text-2xl font-bold mb-4">Edit Comment</h2>
                <form @submit.prevent="saveComment">
                    <div class="mb-4">
                        <label for="commentContent" class="block text-sm font-medium text-gray-700 mb-1">
                            Comment
                        </label>
                        <textarea id="commentContent" v-model="editedComment" rows="4"
                            class="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your comment here..." required></textarea>
                            <p v-if="error" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
                    </div>
                    <div class="flex justify-end space-x-3">
                        <button type="button" @click="toggleAction(props.comment?.id || props.reply?.id || '', 'edit')"
                            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            @click="saveComment"
                            :disabled="isLoading"
                            >
                            {{ isLoading ? 'Saving...' : 'Save Changes' }}
                            </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>