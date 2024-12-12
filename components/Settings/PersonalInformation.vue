<template>
    <div>
      <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Personal Information</h2>
      <form @submit.prevent="handlePersonalInfoSubmit" class="space-y-4">
        <AvatarUpload
          :current-avatar="profile_url"
          @avatar-change="handleAvatarChange"
          :is-uploading="isUploading"
        />
        <InputField
          id="username"
          v-model="username"
          label="Username"
          :placeholder="currentUser?.user_metadata?.username"
        />
        <InputField
          id="email"
          v-model="email"
          type="email"
          label="Email"
          :placeholder="currentUser?.email"
        />
        <TextareaField
          id="desc"
          v-model="desc"
          label="Bio"
          :placeholder="currentUser?.user_metadata?.description"
        />
        <Button type="submit" :disabled="isUploading" class="w-full">
          {{ isUploading ? 'Saving...' : 'Save Changes' }}
        </Button>
      </form>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, inject } from 'vue'
  
  const client = useSupabaseClient()
  const currentUser = inject<any>('currentUser')
  const showNotification = inject<any>('showNotification')
  
  const username = ref('')
  const email = ref('')
  const desc = ref('')
  const profile_url = ref('')
  const photoFile = ref<File | null>(null)
  const isUploading = ref(false)
  
  const handleAvatarChange = (file: File) => {
    photoFile.value = file
  }
  
  const handlePersonalInfoSubmit = async () => {
    try {
      isUploading.value = true
      let publicUrl = currentUser.value?.user_metadata?.profile_url
  
      if (photoFile.value) {
        const fileExt = photoFile.value.name.split('.').pop()
        const fileName = `avatar_${Date.now()}.${fileExt}`
  
        const { error: uploadError } = await client.storage
          .from('profile_avatar')
          .upload(fileName, photoFile.value)
  
        if (uploadError) throw uploadError
  
        const { data: { publicUrl: newUrl } } = client.storage
          .from('profile_avatar')
          .getPublicUrl(fileName)
  
        publicUrl = newUrl
      }
  
      const { data: userData, error: updateError } = await client.auth.updateUser({
        email: email.value || currentUser.value?.email,
        data: {
          username: username.value || currentUser.value?.user_metadata?.username,
          description: desc.value || currentUser.value?.user_metadata?.description,
          profile_url: publicUrl,
        },
      })
  
      if (updateError) throw updateError
  
      if (userData?.user) {
        currentUser.value = userData.user
        profile_url.value = publicUrl
      }
  
      photoFile.value = null
      showNotification('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      showNotification('Failed to update profile', 'error')
    } finally {
      isUploading.value = false
    }
  }
  </script>