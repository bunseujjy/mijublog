<script setup lang="ts">
import type { Replies, Comment } from "~/lib/type";
import { getComment } from "~/server/comments/getComment";
import {
  getCurrentUserCmt,
  getRepliesResponse,
} from "~/server/comments/getResponse";
import { getReplies } from "~/server/comments/getReplies";
import { compileTemplate } from "vue/compiler-sfc";

const { user: currentUser } =useAuth();
const { isLoading, error, fetchPosts, findPostAuthor } = useBlogPosts();

const client = useSupabaseClient();
const responses = ref<Comment[]>([]);
const replyResponse = ref<Replies[]>([]);

onMounted(async () => {
  await fetchPosts(); // Ensure posts are fetched first
  fetchResponses(); // Fetch responses after posts are loaded
});

// Function to fetch responses
const fetchResponses = async () => {
  if (!currentUser.value?.id) return;

  try {
    const [cmt, reply] = await Promise.all([
      getCurrentUserCmt(currentUser.value.id),
      getRepliesResponse(currentUser.value.id),
    ]);
    responses.value = cmt || [];
    replyResponse.value = reply || [];
  } catch (err) {
    console.error("Error fetching responses:", err);
  }
};

onMounted(() => {
  fetchResponses;
  client
    .channel("comments")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "comments" },
      (payload) => {
        const updatedComment = payload.new as Comment; // Type assertion
        const deletedComment = payload.old as Comment; // Type assertion

        if (payload.eventType === "UPDATE" && updatedComment) {
          const index = responses.value.findIndex(
            (data) => data.id === updatedComment.id
          );
          if (index !== -1) {
            responses.value[index] = updatedComment;
          } else {
            responses.value.unshift(updatedComment);
          }
        } else if (payload.eventType === "DELETE" && deletedComment) {
          responses.value = responses.value.filter(
            (data) => data.id !== deletedComment.id
          );
        }
      }
    )
    .subscribe();

  client
    .channel("replies")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "replies" },
      (payload) => {
        const updatedReply = payload.new as Replies; // Type assertion
        const deletedReply = payload.old as Replies; // Type assertion

        if (payload.eventType === "UPDATE" && updatedReply) {
          const index = replyResponse.value.findIndex(
            (data) => data.id === updatedReply.id
          );
          if (index !== -1) {
            replyResponse.value[index] = updatedReply;
          } else {
            replyResponse.value.push(updatedReply);
          }
        } else if (payload.eventType === "DELETE" && deletedReply) {
          replyResponse.value = replyResponse.value.filter(
            (data) => data.id !== deletedReply.id
          );
        }
      }
    )
    .subscribe();
});

onBeforeUnmount(() => {
  client.channel("comments").unsubscribe();
  client.channel("replies").unsubscribe();
});

useSeoMeta({
        title: `${currentUser?.value?.user_metadata?.username} | Response`,
        ogTitle: `${currentUser?.value?.user_metadata?.username} | Response`,
        ogUrl: `${import.meta.env.VITE_BASE_URL}/me/stories/response`,
        twitterTitle: `${currentUser?.value?.user_metadata?.username} | Response`,
  })
</script>

<template>
  <div class="min-h-screen">
    <BlogHeader title="Your Responses" />
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Tabs default-value="response" class="w-full items-start">
        <BlogNavigation />
        <TabsContent value="response">
          <div class="py-6">
            <template v-if="isLoading">
              <div class="text-center py-4 text-black dark:text-white">
                Loading...
              </div>
            </template>

            <template v-else-if="error">
              <div class="text-center text-red-500 py-4">
                {{ error.message }}
              </div>
            </template>

            <template v-else-if="responses.length || replyResponse.length">
              <li
                v-for="response in responses"
                :key="response.id"
                class="border-b border-b-muted pb-5 transition-all duration-300 ease-in-out mt-5 marker:dark:text-white"
              >
                <ResponseList
                  :response="response"
                  :reply="null"
                  :author="findPostAuthor(response.user_id ?? '')"
                />
              </li>
              <li
                v-for="reply in replyResponse"
                :key="reply.id"
                class="border-b border-b-muted pb-5 transition-all duration-300 ease-in-out mt-5 marker:dark:text-white"
              >
                <ResponseList
                  :response="null"
                  :reply="reply"
                  :author="findPostAuthor(reply.user_id)"
                />
              </li>
            </template>

            <template v-else>
              <div class="text-center text-gray-500 dark:text-gray-400 py-4">
                You haven't written any responses yet.
              </div>
            </template>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>
