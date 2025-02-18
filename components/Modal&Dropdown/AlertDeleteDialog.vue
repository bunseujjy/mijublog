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
    title: string;
}>()

const emit = defineEmits(['handleDelete'])

const handleDelete = async () => {
  emit('handleDelete')
}
</script>

<template>
  <AlertDialog>
    <AlertDialogTrigger as-child>
      <Button variant="outline" class="w-full !justify-start !bg-transparent !border-0 !font-normal hover:text-black hover:!bg-white">
        <slot name="icon"></slot>  Delete {{ props.title }}
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete this {{ props.title.charAt(0).toLocaleLowerCase() + props.title.slice(1).toLocaleLowerCase() }} and remove your data from our servers.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction @click="handleDelete">Continue</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>