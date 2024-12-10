<script setup lang="ts">
import { Camera } from 'lucide-vue-next';
import { ref } from 'vue';
import { useToast } from '~/components/ui/toast';

const tabs = [
  { label: 'Personal Information', value: 'personal' },
  { label: 'Security', value: 'security' },
  { label: 'Notifications', value: 'notifications' },
  { label: 'Appearance', value: 'appearance' },
]

const client = useSupabaseClient()
const color = useColorMode()
const {toast} = useToast()
const {user: currentUser} = useAuth()
const username = ref('')
const email = ref('')
const desc = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const emailNotifications = ref(true)
const pushNotifications = ref(false)
const showOverlay = ref(false)
const theme = ref('light')
const profile_url = ref('')
const photoFile = ref<File | null>(null)
const isUploading = ref(false)
const isEditing = ref(false)
const description = ref('')

const cancelEditing = () => {
    isEditing.value = false
    description.value = ''
  }

const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  photoFile.value = file;

  // Preview the image
  const reader = new FileReader();
  reader.onload = (e: ProgressEvent<FileReader>) => {
    profile_url.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};
  
const handlePersonalInfoSubmit = async () => {
  try {
    isUploading.value = true;
    showOverlay.value = true;

    let publicUrl = currentUser.value?.user_metadata?.profile_url;

    // Only upload new image if photoFile exists
    if (photoFile.value) {
      const fileExt = photoFile.value.name.split('.').pop();
      const fileName = `avatar_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await client.storage
        .from('profile_avatar')
        .upload(fileName, photoFile.value);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl: newUrl } } = client.storage
        .from('profile_avatar')
        .getPublicUrl(fileName);

      publicUrl = newUrl;
    }

    // Update user metadata
    const { data: userData, error: updateError } = await client.auth.updateUser({
      email: email.value || currentUser.value?.email,
      data: {
        username: username.value || currentUser.value?.user_metadata?.username,
        description: desc.value || currentUser.value?.user_metadata?.description,
        profile_url: publicUrl,
      },
    });

    if (updateError) throw updateError;

    // Update local user state
    if (userData?.user) {
      profile_url.value = publicUrl;
    }

    // Reset file input
    photoFile.value = null;
    
    // Show success message
    toast({description: 'Profile updated successfully'});

  } catch (error) {
    console.error('Error updating profile:', error);
    toast({description: 'Failed to update profile', variant: "destructive"});
  } finally {
    isUploading.value = false;
    showOverlay.value = false;
  }
};

const handlePasswordChange = async () => {
  try {
    if (newPassword.value !== confirmPassword.value) {
      toast({description: "New passwords don't match!", variant: "destructive"});
      return;
    }

    const { error } = await client.auth.updateUser({
      password: newPassword.value,
    });

    if (error) throw error;

    // Reset password fields
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';

    toast({description: 'Password updated successfully'});
  } catch (error) {
    console.error('Error updating password:', error);
    toast({description: 'Failed to update password', variant: 'destructive'});
  }
};

const updateColorPreference = () => {
  color.preference = theme.value;
};

// Initialize user data when component mounts
onMounted(async () => {
  const { data: { user } } = await client.auth.getUser();
  if (user) {
    profile_url.value = user.user_metadata?.profile_url || '';
    username.value = user.user_metadata?.username || '';
    email.value = user.email || '';
    desc.value = user.user_metadata?.description || '';
  }
});
</script>

<template>
  <div class="px-4 max-w-screen-xl mx-auto md:px-8 py-10">
    <Head>
      <Title>Settings</Title>
      <Meta name="description" content="Editing your account here..."/>
    </Head>
    <h1 class="text-black dark:text-muted text-3xl font-bold mb-6">Profile Settings</h1>
    <Tabs default-value="personal" class="space-y-8">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>
        
      <TabsContent value="personal" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-black dark:text-white text-xl font-semibold mb-4">Personal Information</h2>
        <form @submit.prevent="handlePersonalInfoSubmit" class="space-y-4">
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
      </TabsContent>

      <TabsContent value="security" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-black dark:text-white text-xl font-semibold mb-4">Security</h2>
        <form @submit.prevent="handlePasswordChange" class="space-y-4">
          <div>
            <label for="current-password" class="block text-sm font-medium text-gray-700 dark:text-white">Current Password</label>
            <input
              id="current-password"
              v-model="currentPassword"
              type="password"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2 outline-none transform duration-300"
            >
          </div>
          <div>
            <label for="new-password" class="block text-sm font-medium text-gray-700 dark:text-white">New Password</label>
            <input
              id="new-password"
              v-model="newPassword"
              type="password"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2 outline-none transform duration-300"
            >
          </div>
          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700 dark:text-white">Confirm New Password</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2 outline-none transform duration-300"
            >
          </div>
          <button type="submit" class="w-full bg-blue-500 dark:bg-black dark:border dark:border-muted dark:hover:bg-opacity-60 text-white py-2 px-4 rounded-md hover:bg-blue-600 dark:hover:bg-transparent focus:outline-none focus:ring-opacity-50 transform duration-300">
            Change Password
          </button>
        </form>
      </TabsContent>

      <TabsContent value="notifications" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-black dark:text-white text-xl font-semibold mb-4">Notifications</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-700 dark:text-white">Email Notifications</h3>
              <p class="text-sm text-gray-500 dark:text-white">Receive notifications via email</p>
            </div>
            <Switch v-model="emailNotifications" />
          </div>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-700 dark:text-white">Push Notifications</h3>
              <p class="text-sm text-gray-500 dark:text-white">Receive push notifications on your devices</p>
            </div>
            <Switch v-model="pushNotifications" />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="appearance" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-black dark:text-white text-xl font-semibold mb-4">Appearance</h2>
        <div>
          <label for="theme" class="block text-sm font-medium text-gray-700 dark:text-white">Theme</label>
          <select
            id="theme"
            v-model="theme"
            @change="updateColorPreference"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      </TabsContent>
    </Tabs>

    <div class="mt-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
      <p class="font-bold">Heads up!</p>
      <p>Your profile information is visible to other users. Be mindful of what you share.</p>
    </div>
  </div>
</template>

<style scoped>
.loading-overlay {
  @apply absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full;
}

.loading-spinner {
  @apply animate-spin rounded-full h-6 w-6 border-b-2 border-white;
}
</style>