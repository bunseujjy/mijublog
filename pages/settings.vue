<script setup lang="ts">
import { ref } from 'vue';

const tabs = [
  { label: 'Personal Information', value: 'personal' },
  { label: 'Security', value: 'security' },
  { label: 'Notifications', value: 'notifications' },
  { label: 'Appearance', value: 'appearance' },
]

const client = useSupabaseClient()
const {user: currentUser} = useAuth()
const username = ref('')
const email = ref('')
const desc = ref('')
const profile_url = ref('')

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

useSeoMeta({
  title: `${currentUser.value?.user_metadata.username} | Settings`,
  ogTitle: `${currentUser.value?.user_metadata.username} | Settings`,
  ogDescription:
    currentUser.value?.user_metadata.description ||
    "Discover the world of Chinese or Korean dramas with us! Dive into captivating stories, explore a community of fans, and find everything you need to start your dramas journey.",
  ogImage: currentUser.value?.user_metadata?.profile_url || "/default-pf.jpg",
  ogUrl: `${import.meta.env.VITE_BASE_URL}/settings`,
  description:
    currentUser.value?.user_metadata.description ||
    "Discover the world of Chinese or Korean dramas with us! Dive into captivating stories, explore a community of fans, and find everything you need to start your dramas journey.",
  twitterTitle: `${currentUser.value?.user_metadata.username} | Settings`,
  twitterDescription:
    currentUser.value?.user_metadata.description ||
    "Discover the world of Chinese or Korean dramas with us! Dive into captivating stories, explore a community of fans, and find everything you need to start your dramas journey.",
  twitterImage:
    currentUser.value?.user_metadata?.profile_url || "/default-pf.jpg",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div class="px-4 max-w-screen-xl mx-auto md:px-8 py-10">
    <h1 class="text-black dark:text-muted text-3xl font-bold mb-6">Profile Settings</h1>
    
    <Tabs default-value="personal" class="space-y-8">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>
        
      <TabsContent value="personal" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-black dark:text-white text-xl font-semibold mb-4">Personal Information</h2>
        <PersonalInformation :current-user="currentUser" />
      </TabsContent>

      <TabsContent value="security" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-black dark:text-white text-xl font-semibold mb-4">Security</h2>
        <Security />
      </TabsContent>

      <TabsContent value="notifications" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-black dark:text-white text-xl font-semibold mb-4">Notifications</h2>
        <div class="space-y-6">
          <EmailToggle />
          <PushToggle />
        </div>
      </TabsContent>

      <TabsContent value="appearance" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 class="text-black dark:text-white text-xl font-semibold mb-4">Appearance</h2>
        <Appearance />
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