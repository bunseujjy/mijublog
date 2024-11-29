<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Bookmark, XIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { User } from "@supabase/auth-js";
import { Switch } from '@/components/ui/switch';
import { newUserList } from "~/server/list/newList";
import { getLists } from "~/server/list/getLists";
import { savePost } from "~/server/post/savePost";
import { removePostFromList } from "~/server/list/removePostFromList";
import type { BlogData } from "~/lib/type";

interface List {
  id: string;
  name: string;
  isChecked: boolean;
}

const props = defineProps<{
  currentUser: User;
  blog_db: BlogData;
}>();

const showModal = ref(false);
const newListName = ref("");
const description = ref("");
const isPublic = ref(false);
const existingLists = ref<List[]>([]);

const openNewListModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  newListName.value = "";
  description.value = "";
  isPublic.value = false;
};

const createNewList = async () => {
  if (!newListName.value.trim()) return;

  try {
    await newUserList(
      props.currentUser.id,
      newListName.value.trim(),
      description.value,
      isPublic.value ? "Public" : "Private"
    );
    await loadLists();
    closeModal();
  } catch (error: any) {
    console.error("Failed to create new list:", error.message);
    alert("Failed to create new list. Please try again later.");
  }
};

const loadLists = async () => {
  try {
    const lists = await getLists(props.currentUser.id);
    existingLists.value = lists.map(list => ({
      ...list,
      isChecked: false
    }));
    
    // Check which lists contain this post
    for (const list of existingLists.value) {
      try {
        const hasPost = await checkPostInList(list.id);
        list.isChecked = hasPost;
      } catch (error) {
        console.error(`Error checking post in list ${list.id}:`, error);
      }
    }
  } catch (error: any) {
    console.error("Error fetching lists:", error.message);
  }
};

const checkPostInList = async (listId: string): Promise<boolean> => {
  try {
    // This should be implemented to check if the post exists in the list
    // For now, returning false as placeholder
    return false;
  } catch (error) {
    console.error('Error checking post in list:', error);
    return false;
  }
};

const handleCheckboxChange = async (list: List, checked: boolean) => {
  const originalState = list.isChecked;
  list.isChecked = checked;

  try {
    if (checked) {
      await savePost(props.currentUser.id, props.blog_db.id, list.id);
      console.log('Post saved to list:', list.id);
    } else {
      await removePostFromList(props.currentUser.id, props.blog_db.id, list.id);
      console.log('Post removed from list:', list.id);
    }
  } catch (error: any) {
    console.error("Failed to update list:", error.message);
    // Revert the checkbox state on error
    list.isChecked = originalState;
    alert("Failed to update the list. Please try again.");
  }
};

onMounted(() => {
  loadLists();
});
</script>

<template>
  <div class="relative">
    <DropdownMenu v-if="!showModal">
      <DropdownMenuTrigger as-child>
        <Button
          class="text-black dark:text-white hover:!text-white cursor-pointer hover:opacity-60 transform duration-300 align-bottom">
          <Bookmark />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56 dark:bg-gray-800 dark:text-white">
        <div class="p-2">
          <div class="border-b border-b-muted-foreground dark:border-b-muted pt-2 pb-5">
            <div v-for="list in existingLists" :key="list.id" class="flex items-center space-x-2 mb-2">
              <Checkbox 
                :id="'list-' + list.id"
                :checked="list.isChecked"
                @update:checked="(checked) => handleCheckboxChange(list, checked)"
              />
              <label :for="'list-' + list.id"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {{ list.name }}
              </label>
            </div>
          </div>
          <div class="py-1" role="none">
            <a @click="openNewListModal"
              class="block px-4 py-2 text-sm text-gray-700 dark:text-muted hover:bg-gray-100 dark:hover:bg-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md cursor-pointer"
              role="menuitem">
              Create New List
            </a>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>

    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 cursor-default">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative">
          <button @click="closeModal"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close modal">
            <XIcon :size="24" />
          </button>
          <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create New List</h2>
          <div class="space-y-4">
            <div>
              <label for="list-name"
                class="block text-start text-sm font-medium text-gray-700 dark:text-gray-300">
                List Name
              </label>
              <input id="list-name" v-model="newListName" type="text"
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white px-4 py-2"
                placeholder="Enter list name" />
            </div>
            <div>
              <label for="list-description"
                class="block text-start text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea id="list-description" v-model="description" rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white px-4 pt-2"
                placeholder="Enter list description"></textarea>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Make list public</span>
              <Switch v-model="isPublic" />
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3 py-2">
            <Button @click="closeModal" variant="outline">
              Cancel
            </Button>
            <Button @click="createNewList">
              Save List
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>