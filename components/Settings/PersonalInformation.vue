<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="flex items-center space-x-4 mb-4">
      <div class="relative w-20 h-20">
        <img 
          :src="profile_url || currentUser?.user_metadata?.profile_url" 
          alt="profile" 
          class="w-20 h-20 rounded-full object-cover"
        />
        <div v-if="isUploading" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      </div>
      <div>
        <label for="avatar-upload" class="cursor-pointer text-sm text-blue-500 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 transform duration-300">
          <span class="flex items-center">
            <Camera class="h-5 w-5 mr-1" />
            Change avatar
          </span>
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleAvatarChange"
        >
      </div>
    </div>

    <div>
      <label for="username" class="block text-sm font-medium text-gray-700 dark:text-white">Username</label>
      <input
        id="username"
        v-model="username"
        type="text"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2 outline-none transform duration-300"
        :placeholder="currentUser?.user_metadata?.username"
      >
    </div>

    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 dark:text-white">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2 outline-none transform duration-300"
        :placeholder="currentUser?.email"
      >
    </div>

    <div>
      <ClientOnly>
        <ProfileEditor :user="currentUser" @cancelEditing="cancelEditing" title="Biography"/>
      </ClientOnly>
    </div>

    <button 
      type="submit" 
      class="w-full bg-blue-500 dark:bg-black dark:border dark:border-muted dark:hover:bg-opacity-60 text-white py-2 px-4 rounded-md hover:bg-blue-600 dark:hover:bg-transparent focus:outline-none focus:ring-opacity-50 transform duration-300"
      :disabled="isUploading"
    >
      {{ isUploading ? 'Saving...' : 'Save Changes' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { Camera } from 'lucide-vue-next'
import { useToast } from '~/components/ui/toast'

const props = defineProps<{
  currentUser: any
}>()

const { toast } = useToast()
const { isUploading, profile_url, handleAvatarChange, uploadAvatar, username, email, desc, updateUserProfile } = useAuth()

const handleSubmit = async () => {
  try {
    isUploading.value = true
    const publicUrl = await uploadAvatar()
    await updateUserProfile(publicUrl ?? '')
    toast({ description: 'Profile updated successfully' })
  } catch (error) {
    console.error('Error updating profile:', error)
    toast({ description: 'Failed to update profile', variant: "destructive" })
  } finally {
    isUploading.value = false
  }
}

const cancelEditing = () => {
  // Handle cancel editing logic
    desc.value = ''
}
</script>