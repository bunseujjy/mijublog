<script setup lang="ts">
    import type { BlogData, Lists, SavedPosts } from '~/lib/type';
import { deletingSavedPost } from '~/server/post/deletingSavedPost';
import { useToast } from '../ui/toast';
import type { User } from '@supabase/supabase-js'

    const props = defineProps<{
        list_db: Lists | null;
        saved_posts: SavedPosts[];
        all_post: BlogData[];
        owner: User | null;
    }>()
    const emits = defineEmits(['cancelRemoving'])
    const { toast } = useToast()
    const isSelected = ref<Record<string, boolean>>({}); // Initialize as an empty object

    const findBlogPost = (post_id: string) => {
        return props.all_post.filter((data) => data.id === post_id)
    }

    const toggleCheckbox = (post_id: string) => {
        // Ensure the property exists or toggle its value
        isSelected.value[post_id] = !isSelected.value[post_id];
    };

    // Compute whether any checkbox is selected
    const anySelected = computed(() => Object.values(isSelected.value).some((value) => value));

    const cancelRemoved = () => {
        emits('cancelRemoving')
    }

    const updatingDatabase = async () => {
    const selectedPosts = Object.keys(isSelected.value).filter((post_id) => isSelected.value[post_id]);

    if (selectedPosts.length === 0) {
        toast({ description: 'No items selected', variant: 'destructive' });
        return;
    }

    const failedPosts: string[] = [];
    for (const post_id of selectedPosts) {
        try {
            const data = await deletingSavedPost(post_id, props.owner?.id ?? '', props.list_db?.id ?? '');
            if (!data) {
                failedPosts.push(post_id);
            }
        } catch (error) {
            failedPosts.push(post_id);
        }
    }

    if (failedPosts.length > 0) {
        toast({ description: `${failedPosts.length} items failed to remove`, variant: 'destructive' });
    } else {
        toast({ description: 'Selected items have been removed from the list' });
    }

    // Clear the selection after successful removal
    for (const post_id of selectedPosts) {
        isSelected.value[post_id] = false;
    }
    };

</script>

<template>
    <div class="my-4">
        <h1 class="text-2xl font-bold pb-2">{{ list_db?.name }}</h1>
        <p>{{ list_db?.description }}</p>
        <div class="flex items-center space-x-4 mt-4">
            <Button @click="cancelRemoved">Cancel</Button>
            <Button :disabled="!anySelected" :class="['cursor-pointer', {'cursor-not-allowed' : !anySelected}]" @click="updatingDatabase">Remove Selected</Button>
        </div>
        <div v-for="list in saved_posts.filter((data) => data.list_id === list_db?.id)" :key="list.id" class="mt-10">
            <div v-for="blog in findBlogPost(list.post_id)" :key="blog.id"
                class="flex items-center border-b border-b-muted pb-4">
                <div class="flex items-center cursor-pointer"  @click="toggleCheckbox(blog.id)">
                    <Checkbox :checked="isSelected[blog.id]"/>
                        <h1 class="pl-2">{{ blog.title }}</h1>

                </div>
            </div>
        </div>
    </div>
</template>