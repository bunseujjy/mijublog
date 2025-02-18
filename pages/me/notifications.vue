<script setup lang="ts">
  import { Bell, Settings, Trash2, MessageSquare, Send, UserPlus, CheckCircle, XCircle, type LucideProps } from 'lucide-vue-next'
  import { useToast } from '~/components/ui/toast';
  import { getAuthorDetails } from '~/lib/getAuthorDetails';
  import { formattedDate } from '~/lib/formattedDate';
  import type { FunctionalComponent } from 'vue';

  const { toast } = useToast()
  const { notifications, fetchNotification, markAllNotificationAsRead, clearNotification, clearAllNotifications, setupRealtimeNotifications } = await useNotifications()
  const { users} =useAuth();
  const filter = ref('all')
  const search = ref('')
  const isLoading = ref(true)

  const fetchNotifications = async () => {
    isLoading.value = true
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    isLoading.value = false
  }

  onMounted(fetchNotifications)

  const filteredNotifications = computed(() => {
    return notifications.value
      .filter(n => filter.value === 'all' || n.status !== 'read') // filter out 'read' status if not 'all'
      .filter(n => n.message && n.message.toLowerCase().includes(search.value.toLowerCase())) // filter by search term
      .sort((a, b) => Date.parse(b.updated_at ?? '') - Date.parse(a.updated_at ?? '')) // sort by most recent
  });


  const markAllAsRead = async () => {
    await markAllNotificationAsRead();
    notifications.value = notifications.value.map(notification => ({
      ...notification,
      status: 'read'
    }));
    toast({
      title: "All notifications marked as read",
      duration: 2000,
    })
  }

  const clearAll = async () => {
    await clearAllNotifications()
    toast({
      title: "All notifications cleared",
      duration: 2000,
    })
  }

  const deleteNotification = async (id: number) => {
    await clearNotification(id)
    toast({
      title: "Notification deleted",
      duration: 2000,
    })
  }

  const notificationIcon = (type: string): FunctionalComponent<LucideProps> | undefined => {
    const icons: Record<string, FunctionalComponent<LucideProps>> = {
      comment: MessageSquare,
      publish: Send,
      follow: UserPlus,
    };

    return icons[type] || undefined; // Provide a fallback for unexpected keys
  };


  onMounted(async () => {
    await fetchNotification(); // Load initial notifications
    setupRealtimeNotifications(); // Start real-time updates
  });

  onUnmounted(() => {
    // Optional: Clean up the real-time channel if needed
    const channel = setupRealtimeNotifications();
    channel.unsubscribe();
  });

  useSeoMeta({
  title: 'Notifications',
  ogTitle: 'Notifications',
  ogUrl: `${import.meta.env.VITE_BASE_URL}/me/notifications`,
  twitterTitle: 'Notifications',
});
</script>

<template>
  <div class="max-w-screen-xl mx-auto py-4 md:px-8 sm:py-8 transition-colors duration-200 ease-in-out">
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200 ease-in-out">
      <div
        class="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-700 gap-4 sm:gap-2">
        <div class="flex items-center gap-3">
          <Bell class="h-6 w-6 text-gray-600 dark:text-gray-300" />
          <h1 class="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white ml-2">Notifications</h1>
        </div>
        <div class="flex flex-wrap items-center space-x-2">
          <button
            class="text-xs sm:text-sm flex items-center gap-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 ease-in-out p-2 rounded-md"
            @click="markAllAsRead" title="Mark all notifications as read">
            <CheckCircle class="w-4 h-4" />
            Mark all as read
          </button>
          <button
            class="text-xs sm:text-sm flex items-center gap-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 ease-in-out p-2 rounded-md"
            @click="clearAll" title="Clear all notifications">
            <XCircle class="w-4 h-4" />
            Clear all
          </button>
          <button
            class="btn btn-ghost btn-square btn-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out"
            aria-label="Notification settings" title="Notification settings">
            <Settings class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex flex-col sm:flex-row gap-4">
          <input type="text" v-model="search" placeholder="Search notifications..."
            class="flex-grow px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent" />
          <div class="flex">
            <button @click="filter = 'all'" :class="[
              'px-4 py-2 text-sm font-medium rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600',
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
            ]">
              All
            </button>
            <button @click="filter = 'unread'" :class="[
              'px-4 py-2 text-sm font-medium rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600',
              filter === 'unread'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
            ]">
              Unread
            </button>
          </div>
        </div>
      </div>

      <div
        class="overflow-auto h-[calc(100vh-16rem)] sm:h-[500px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <div v-if="isLoading" class="flex justify-center items-center h-full">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 dark:border-gray-100">
          </div>
        </div>
        <div v-else-if="filteredNotifications.length === 0"
          class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <Bell class="h-16 w-16 mb-4 opacity-20" />
          <p class="text-lg">No notifications</p>
        </div>
        <TransitionGroup v-else name="list" tag="div">
          <div v-for="notification in filteredNotifications" :key="notification.id" :class="[
            'p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out border-b border-gray-200 dark:border-gray-700',
            { 'bg-blue-50 dark:bg-blue-900/20': notification.status !== 'read' }
          ]">
            <div class="flex items-start gap-4">
              <NuxtImg format="webp" loading="lazy" :src="getAuthorDetails(users, notification.sender_id || '')?.user_metadata?.profile_url"
                :alt="getAuthorDetails(users, notification?.sender_id ?? '')?.user_metadata?.username"
                class="w-10 h-10 rounded-full object-cover" />
              <div class="flex-1 min-w-0">
                <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  {{ notification.message }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{{
                  formattedDate(notification.updated_at ?? '') }}</p>
                <div class="flex items-center mt-2">
                  <span
                    class="inline-flex items-center rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 mr-2 px-2 py-1">
                    <component :is="notificationIcon(notification.type ?? '')" class="w-3 h-3 mr-1" />
                    {{ notification.type
                      ? notification.type.charAt(0).toUpperCase() + notification.type.slice(1).toLowerCase()
                    : 'Unknown' }}
                  </span>
                  <span v-if="notification.status !== 'read'"
                    class="inline-flex items-center text-black dark:text-muted px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 dark:text-blue-200">
                    New
                  </span>
                </div>
              </div>
              <button @click="deleteNotification(notification.id)"
                class="btn btn-ghost btn-square btn-sm text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors duration-200 ease-in-out"
                :aria-label="`Delete notification: ${notification.message}`"
                :title="`Delete notification: ${notification.message}`">
                <Trash2 class="h-5 w-5" />
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<style scoped>

  .list-enter-active,
  .list-leave-active {
    transition: all 0.5s ease;
  }

  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }

  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }

  .dark .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgba(75, 85, 99, 0.5);
  }
</style>