<script setup lang="ts">
import type { User } from '@supabase/supabase-js';
import type { PublicUser } from '~/lib/type';

const props = defineProps<{
    user: User | null;
    currentUser: User | null;
    publicUser: PublicUser | undefined;
}>()


const isEditing = ref(false)
  const description = ref('')

  const startEditing = () => {
    isEditing.value = true
    description.value = props.user?.user_metadata?.desc || props.user?.user_metadata?.description || ''
  }

  const cancelEditing = () => {
    isEditing.value = false
    description.value = ''
  }
</script>

<template>
    <div class="px-4" v-if="currentUser.id === user?.id">
          <div v-if="user?.user_metadata?.description">
            <div v-show="isEditing">
              <ClientOnly>
                <ProfileEditor :user="user" @cancelEditing="cancelEditing" title="About Me"/>
              </ClientOnly>
            </div>
            <div v-show="!isEditing" v-html="user?.user_metadata?.description"
              class="text-gray-600 dark:text-muted mb-4">
            </div>
            <div class="space-x-4 text-end">

              <button v-show="isEditing" @click="cancelEditing" type="button"
                class="text-black dark:text-white border border-gray-300 rounded-full py-2 px-4 hover:bg-gray-100 hover:text-black transition-colors duration-200">
                Cancel
              </button>
              <button @click="startEditing" type="button"
                class="text-black dark:text-white border border-gray-300 rounded-full py-2 px-4 hover:bg-gray-100 hover:text-black transition-colors duration-200">Edit</button>
            </div>
          </div>
          <div v-else>
            <div v-if="!isEditing" class="bg-[#F9F9F9] text-center px-5 py-9 space-y-4">
              <p>Share your love for Asian dramas!</p>
              <p>Here's your chance to tell others about your favorite dramas, actors, and genres. Share your journey
                into the world of Asian entertainment, your reviews of must-watch shows, hidden gems, and even fan
                theories. Personalize your bio with rich text and images to showcase your unique perspective!</p>
              <button @click="startEditing" type="button"
                class="border border-black rounded-full py-2 px-4 hover:bg-gray-100 transition-colors duration-200">
                Get Started
              </button>
            </div>
            <div v-else class="space-y-4">
              <ClientOnly>
                <ProfileEditor :user="user" @cancelEditing="cancelEditing" title="About Me"/>
              </ClientOnly>

              <div class="flex justify-end space-x-2">
                <button @click="cancelEditing" type="button"
                  class="text-black dark:text-white border border-gray-300 rounded-full py-2 px-4 hover:bg-gray-100 hover:text-black transition-colors duration-200">
                  Cancel
                </button>
                <button type="button"
                  class="bg-indigo-600 text-white rounded-full py-2 px-4 hover:bg-indigo-700 transition-colors duration-200">
                  Save
                </button>
              </div>
            </div>
          </div>
          <div class="pt-5">
            <div class="text-black dark:text-orange-400" v-if="user?.id === currentUser?.id">
              <p>{{ publicUser?.follower_length }} Followers <span>·</span> {{ publicUser?.following_length }} Following</p>
            </div>
          </div>
        </div>
        <div v-else>
          <div v-if="user?.user_metadata?.description" v-html="user?.user_metadata?.description"
              class="text-gray-600 dark:text-muted mb-4 px-6">
            </div>
            <div v-else>
              <div v-if="!isEditing" class="bg-[#F9F9F9] text-center px-5 py-9 space-y-4">
              <p>This user does not have biography yet!</p>
            </div>
            </div>
        </div>
</template>