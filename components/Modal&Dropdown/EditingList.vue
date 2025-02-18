<script setup lang="ts">
import { ref, computed } from 'vue';
import { GripVertical, Loader2 } from 'lucide-vue-next';
import type { User } from '@supabase/supabase-js'
import type { Lists } from '~/lib/type';
import { useToast } from '../ui/toast';
import { Dialog, DialogTrigger } from '../ui/dialog';
import { updatingList } from '~/server/list/updatingList';
import { Textarea } from '../ui/textarea';
import { removeList } from '~/server/list/removeList';

const props = defineProps<{
    article: Lists | null;
    user: User | null;
    url: string;
    linkToCopy: string;
}>()

const { toast } = useToast();
const isWriting = ref(false)
const title = ref(props.article?.name || '')
const description = ref(props.article?.description || '');
const descLength = computed(() => description.value.length);
const isLoading = ref(false)
const activeDialog = ref<'edit' | 'status' | 'delete' | null>(null)
const status = ref(props.article?.status || 'private')

// Watch for changes in the article prop to update the status
watch(() => props.article?.status, (newStatus) => {
    if (newStatus) {
        status.value = newStatus;
    }
}, { immediate: true })

const copyLink = async () => {
    await navigator.clipboard.writeText(props.linkToCopy)
    toast({ description: 'Link copied to clipboard' })
}

const togglePrivacy = (checked: boolean) => {
    status.value = checked ? 'public' : 'private';
};

const updatingLists = async () => {
    try {
        isLoading.value = true;
        const data = await updatingList(
            title.value, 
            description.value, 
            status.value,
            props.user?.id ?? '', 
            props.article?.id ?? ''
        )
        if (data) {
            toast({ description: 'List successfully updated' })
            activeDialog.value = null;
        }
    } catch (error) {
        console.error(error, 'Failed to update the list')
        toast({ 
            description: 'Failed to update the list', 
            variant: 'destructive' 
        })
    } finally {
        isLoading.value = false;
    }
}

const updatingStatus = async (status: string) => {
    try {
        isLoading.value = true;
        const data = await updatingList(
            props.article?.name ?? '', 
            props.article?.description ?? '', 
            status,
            props.user?.id ?? '', 
            props.article?.id ?? ''
        )
        if (data) {
            toast({ description: status === 'private' ? `${props.article?.name} is now private.` : `${props.article?.name} is now public.` })
            activeDialog.value = null;
        }
    } catch (error) {
        console.error(error, 'Failed to update the list')
        toast({ 
            description: 'Failed to update the list', 
            variant: 'destructive' 
        })
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger>
            <Button class="text-black dark:text-white !bg-transparent">
                <GripVertical />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-56">
            <DropdownMenuGroup>
                <DropdownMenuItem @click="copyLink" class="cursor-pointer">
                    <span>Copy Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Dialog :open="activeDialog === 'edit'" @update:open="(value) => activeDialog = value ? 'edit' : null">
                        <DialogTrigger as-child  class="w-full relative flex select-none items-center rounded-sm gap-2 px-2 py-1.5 text-sm outline-none transition-all duration-200 focus:bg-accent focus:text-accent-foreground hover:bg-white hover:text-black group cursor-pointer">
                                <span>Edit List</span>
                        </DialogTrigger>
                        <DialogContent class="max-w-[480px] sm:max-w-[650px] h-[490px] gap-0 bg-white dark:bg-gray-800 text-black dark:text-white px-6 pb-6 pt-5 rounded-lg shadow-lg transition-all duration-200 ease-in-out">
                            <div class="flex flex-col items-center justify-center h-full space-y-6">
                                <DialogHeader class="w-full text-center">
                                    <DialogTitle class="text-2xl font-bold mb-2">Edit List</DialogTitle>
                                    <DialogDescription class="text-sm text-gray-500 dark:text-gray-400">
                                        Customize your list details below
                                    </DialogDescription>
                                </DialogHeader>

                                <div class="w-full space-y-4">
                                    <div>
                                        <Label for="list-name" class="block text-sm font-medium mb-1">List Name</Label>
                                        <Input id="list-name" v-model="title" class="w-full text-black" placeholder="Enter list name" />
                                    </div>

                                    <div>
                                        <div class="flex justify-between items-center mb-1">
                                            <Label for="description" class="block text-sm font-medium">Description</Label>
                                            <span v-if="!isWriting" @click="isWriting = !isWriting"
                                                class="text-sm text-primary hover:text-primary-dark cursor-pointer transition-colors duration-200">
                                                Add Description
                                            </span>
                                        </div>
                                        <Transition name="fade" mode="out-in">
                                            <div v-if="isWriting || description !== ''" class="relative">
                                                <Textarea 
                                                    id="description" 
                                                    v-model="description"
                                                    class="w-full bg-white dark:bg-gray-700 outline-none rounded-md p-4 min-h-[100px] transition-all duration-200"
                                                    :class="{ 'border-red-500': descLength === 250 }" 
                                                    maxlength="250"
                                                    placeholder="Enter list description..." 
                                                />
                                                <div class="absolute bottom-2 right-2 text-sm font-semibold transition-colors duration-200"
                                                    :class="[
                                                        { 'text-gray-400': descLength < 200 },
                                                        { 'text-yellow-500': descLength >= 200 && descLength < 250 },
                                                        { 'text-red-500': descLength === 250 }
                                                    ]">
                                                    {{ descLength }} / 250
                                                </div>
                                            </div>
                                        </Transition>
                                    </div>

                                    <div class="flex items-center space-x-2">
                                        <Checkbox 
                                            id="list-privacy" 
                                            :checked="status !== 'private'"
                                            @update:checked="togglePrivacy"
                                        />
                                        <Label for="list-privacy" class="text-sm cursor-pointer select-none">
                                            Make it private
                                        </Label>
                                    </div>
                                </div>

                                <div class="flex items-center justify-end space-x-4 w-full mt-auto">
                                    <DialogTrigger>
                                        <Button class="px-4 py-2 bg-primary text-white hover:bg-primary-dark transition-all duration-200">
                                            Cancel
                                        </Button>
                                    </DialogTrigger>
                                    <Button 
                                        @click="updatingLists"
                                        :class="{ 'opacity-50 cursor-not-allowed': isLoading }" 
                                        :disabled="isLoading"
                                        class="px-4 py-2 bg-primary text-white hover:bg-primary-dark transition-all duration-200"
                                    >
                                        <span v-if="isLoading" class="flex items-center">
                                            <Loader2 class="animate-spin mr-2 h-4 w-4" />
                                            Updating...
                                        </span>
                                        <span v-else>Done</span>
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <NuxtLink :to="`${linkToCopy}?${url}`" class="w-full">
                        <span>Remove Items</span>
                    </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild class=" cursor-pointer">
                    <div v-if="status === 'private'">
                        <span @click="updatingStatus('public')" class="w-full">Make list public</span>
                    </div>
                    <Dialog v-else :open="activeDialog === 'status'" @update:open="(value) => activeDialog = value ? 'status' : null">
                        <DialogTrigger as-child  class="w-full relative flex select-none items-center rounded-sm gap-2 px-2 py-1.5 text-sm outline-none transition-all duration-200 focus:bg-accent focus:text-accent-foreground hover:bg-white hover:text-black group cursor-pointer">
                                <span class="w-full">Make list {{ status === 'public' ? 'private' : 'public' }}</span>
                        </DialogTrigger>
                        <DialogContent class="max-w-[480px] sm:max-w-[650px] h-[490px] gap-0 bg-white dark:bg-gray-800 text-black dark:text-white px-6 pb-6 pt-5 rounded-lg shadow-lg transition-all duration-200 ease-in-out">
                            <div class="flex flex-col items-center justify-center h-full space-y-6">
                                <DialogHeader>
                                    <DialogTitle class="text-center text-xl md:text-3xl">Make list {{ status === 'public' ? 'private' : 'public' }}</DialogTitle>
                                    <DialogDescription class="dark:text-muted">If others have saved this list, it will be removed from their library.</DialogDescription>
                                </DialogHeader>
                                <div class="flex items-center space-x-4">
                                    <DialogTrigger>
                                        <Button>Cancel</Button>
                                    </DialogTrigger>
                                    <Button @click="updatingStatus('private')">Make list {{ status === 'public' ? 'private' : 'public' }}</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Dialog :open="activeDialog === 'delete'" @update:open="(value) => activeDialog = value ? 'delete' : null">
                        <DialogTrigger as-child  class="w-full relative flex select-none items-center rounded-sm gap-2 px-2 py-1.5 text-sm outline-none transition-all duration-200 focus:bg-accent focus:text-accent-foreground hover:bg-white hover:text-black group cursor-pointer">
                                <span class="w-full">Delete List</span>
                        </DialogTrigger>
                        <DialogContent class="max-w-[480px] sm:max-w-[650px] h-[490px] gap-0 bg-white dark:bg-gray-800 text-black dark:text-white px-6 pb-6 pt-5 rounded-lg shadow-lg transition-all duration-200 ease-in-out">
                            <div class="flex flex-col items-center justify-center h-full space-y-6">
                                <DialogHeader>
                                    <DialogTitle class="text-center text-xl md:text-3xl">Are you sure you want to deleting this delete?</DialogTitle>
                                </DialogHeader>
                                <div class="flex items-center space-x-4">
                                    <DialogTrigger>
                                        <Button>Cancel</Button>
                                    </DialogTrigger>
                                    <Button @click="removeList(user?.id ?? '', article?.id ?? '')">Confirm</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </DropdownMenuItem>
            </DropdownMenuGroup>
        </DropdownMenuContent>
    </DropdownMenu>
</template>