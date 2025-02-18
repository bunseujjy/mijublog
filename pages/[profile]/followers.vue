<script setup lang="ts">
import { Search, ChevronLeft, ChevronRight, UserPlus, UserMinus } from 'lucide-vue-next'
import { useToast } from '~/components/ui/toast';
import type { FollowInfo } from '~/lib/type';
import type { User } from '@supabase/supabase-js'
import { getUserInfo } from '~/server/user/getUserInfo';
import { followAuthor } from '~/server/user/followAuthor';
import { unfollowAuthor } from '~/server/user/unfollowAuthor';

const { toast } = useToast();
const { user: currentUser, users } = useAuth();
const supabase = useSupabaseClient();
const followers = ref<FollowInfo[]>([])
const totalFollowers = ref(0)
const currentPage = ref(1)
const itemsPerPage = 10
const searchQuery = ref('')
const isLoading = ref(false)
const userInfo = ref<FollowInfo[]>([]);
// Fetch user information asynchronously and update the ref
async function fetchUserInfo() {
  try {
    const data = await getUserInfo(); // Replace with your actual API call
    if (data) {
      userInfo.value = data;
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
  }
}
const isFollow = computed(() =>
  userInfo?.value?.some((data: FollowInfo) => 
    data.follower_id === currentUser.value?.id
  )
);
// Fetch followers
const fetchFollowers = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    // Fetch followers from the database
    const { data, error } = await supabase
      .from('user_info')
      .select('*')
      .eq('author_id', currentUser.value?.id ?? '') // Only get followers for current user
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const total = (await supabase
      .from('user_info')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', currentUser.value?.id ?? '')).count;

    return {
      followers: data || [],
      total: total || 0,
    };
  } catch (error) {
    console.error('Error fetching followers:', error);
    throw error;
  }
};

const loadFollowers = async () => {
  isLoading.value = true;
  try {
    const { followers: newFollowers, total } = await fetchFollowers(currentPage.value, itemsPerPage);
    followers.value = newFollowers;
    totalFollowers.value = total;
  } catch (error) {
    console.error("Failed to load followers:", error);
    toast({
      title: "Error",
      description: "Failed to load followers. Please try again.",
      variant: "destructive",
    });
  } finally {
    isLoading.value = false;
  }
};
onMounted(async () => {
  await loadFollowers();
  await fetchUserInfo();
});

const filteredFollowers = computed(() => {
  if (!followers.value) return [];
  
  return followers.value.filter((follower: FollowInfo) => {
    const followerUser = users.value.find(u => u.id === follower.follower_id);
    if (!followerUser) return false;
    
    return followerUser.user_metadata?.username
      ?.toLowerCase()
      .includes(searchQuery.value.toLowerCase());
  });
});

const user: ComputedRef<User | undefined> = computed(() => users.value.find((data) => filteredFollowers .value && filteredFollowers  .value.some((info: FollowInfo) => info.follower_id === data.id)))
const totalPages = computed(() => Math.ceil(totalFollowers.value / itemsPerPage)) || 1

const goToPage = (page: number) => {
  currentPage.value = page
  loadFollowers()
}

const previousPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
  }
}

const toggleFollow = async (targetUserId: string) => {
  const action = isFollow.value ? 'unfollow' : 'follow';
  try {
    if (action === 'follow') {
      await followAuthor(currentUser.value?.id ?? '', 1, currentUser.value?.id ?? '', targetUserId);
    } else {
      await unfollowAuthor(1, currentUser.value?.id ?? '', targetUserId);
    }
    toast({
      title: action === 'follow' ? "Followed" : "Unfollowed",
      description: `You have ${action}ed ${user.value?.user_metadata.username}.`,
    });
    // Reload followers after action
    await loadFollowers();
  } catch (error) {
    console.error(`Failed to ${action} user:`, error);
    toast({
      title: "Error",
      description: `Failed to ${action} user. Please try again.`,
      variant: "destructive",
    });
  }
};

onMounted(() => {
  const channel = supabase
  .channel('user_info')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'user_info' },
    (payload) => {
      console.log('Payload:', payload);

      const updatedData = payload.new as FollowInfo | null;
      const oldData = payload.old as FollowInfo | null;

      // Find the index of the existing record in the userInfo array
      const existingIndex = userInfo.value.findIndex((data) => data.id === updatedData?.id);

      if (payload.eventType === 'INSERT' && updatedData) {
        // Add the new follower if it doesn't already exist
        if (existingIndex === -1) {
          userInfo.value = [...userInfo.value, updatedData];
        }
      } else if (payload.eventType === 'UPDATE' && updatedData) {
        // Update the follower record if it exists
        if (existingIndex !== -1) {
          userInfo.value = [
            ...userInfo.value.slice(0, existingIndex),
            updatedData,
            ...userInfo.value.slice(existingIndex + 1),
          ];
        }
      } else if (payload.eventType === 'DELETE' && oldData) {
        // Remove the follower based on the old data
        userInfo.value = userInfo.value.filter((data) => data.id !== oldData.id);
      }
    }
  )
  .subscribe();
  
  onUnmounted(() => {
    channel.unsubscribe();
  });
});

</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Your Followers</h1>
    
    <!-- Search input -->
    <div class="mb-6 relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search followers..."
        class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      <Search class="absolute left-3 top-3 h-5 w-5 text-gray-400" />
    </div>

    <!-- Followers list -->
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    <div v-else-if="filteredFollowers.length === 0" class="text-center text-gray-600 dark:text-gray-400">
      No followers found.
    </div>
    <ul v-else class="space-y-4">
      <li v-for="follower in filteredFollowers" :key="follower.id" class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center space-x-4 transition-transform duration-200 ease-in-out hover:scale-[1.02]">
        <img :src="user?.user_metadata.profile_url" :alt="user?.user_metadata.username" class="w-16 h-16 rounded-full object-cover" />
        <div class="flex-1">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white">{{ user?.user_metadata.username }}</h2>
          <p class="text-sm text-gray-600 dark:text-gray-300">@{{ user?.user_metadata.username }}</p>
        </div>
        <button 
          @click="toggleFollow(follower.follower_id)"
          class="px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ease-in-out"
          :class="isFollow ? 
            'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600' : 
            'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'"
          :aria-label="!isFollow ? `Unfollow ${user?.user_metadata.username}` : `Follow back ${user?.user_metadata.username}`"
        >
          <span class="flex items-center">
            <component :is="isFollow ? UserMinus : UserPlus" class="h-4 w-4 mr-2" />
            {{ isFollow ? 'Unfollow' : 'Follow Back' }}
          </span>
        </button>
      </li>
    </ul>

    <!-- Pagination -->
    <div class="mt-8 flex justify-between items-center">
      <button 
        @click="previousPage" 
        :disabled="currentPage === 1"
        class="px-4 py-2 flex items-center space-x-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
      >
        <ChevronLeft class="h-4 w-4" />
        <span>Previous</span>
      </button>
      <span class="text-sm text-gray-700 dark:text-gray-300">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button 
        @click="nextPage" 
        :disabled="currentPage === totalPages"
        class="px-4 py-2 flex items-center space-x-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
      >
        <span>Next</span>
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles here */
</style>