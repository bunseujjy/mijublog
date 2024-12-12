<script setup lang="ts">
import type { User } from '@supabase/supabase-js';
import type { Comment, Replies } from '~/lib/type';

defineProps<{
    response: Comment | null;
    reply: Replies | null;
    author: User | undefined;
}>();
</script>

<template>
  <div class="space-y-4">
    <ResponseCard
      :response="response"
      :reply="reply"
      v-bind="response"
      :author="author"
    />
  </div>
</template>