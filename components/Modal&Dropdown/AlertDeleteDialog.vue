<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import type { Comment, Replies } from '~/lib/type';
import { deleteComment } from '~/server/comments/deleteComment';

const props = defineProps<{
    response: Comment | null,
    reply: Replies | null,
}>()

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
  <AlertDialog>
    <AlertDialogTrigger as-child>
      <Button variant="outline" class="!bg-transparent !border-0 ml-2 hover:text-white hover:text-opacity-50">
        Delete Response
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete this response and remove your data from our servers.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction @click="handleDelete">Continue</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>