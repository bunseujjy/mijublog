<script setup lang="ts">
import { Toaster } from '~/components/ui/toast';
import { Bell, Menu, X } from 'lucide-vue-next';
import { SwitchTheme } from '~/components/ui/switch-theme';

export interface Navigation {
  title: string;
  path: string
}

const menuState = ref(false);
const navigation = <Navigation[]>[
  { title: "Home", path: "/" },
  { title: "Contact", path: "/contact" },
  { title: "About", path: "/about" },
];

const { user: currentUser } = useAuth();
const { notifications, fetchNotification, setupRealtimeNotifications } = useNotifications();
const notificationCount: ComputedRef<number> = computed(() => 
  notifications.value.filter(
    (n) => n.sender_id !== currentUser.value?.id
  ).length
);

const config = useRuntimeConfig();

useHead({
  script: [
    {
      async: true,
      src: `https://www.googletagmanager.com/gtag/js?id=${config.public.gtagId}`,
    },
  ],
});

function gtag() {
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push(arguments);
}

const sendPageView = () => {
  const details = {
    page_title: window.document.title,
    page_location: window.location.href
  }
  gtag();
  return details;
}

useRouter().afterEach(() => {
  sendPageView();
});

onMounted(async () => {
  await fetchNotification();
  setupRealtimeNotifications();
});

useHead({
  htmlAttrs: {
    lang: 'en'
  },
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: '/favicon.ico'
    }
  ]
})

useSeoMeta({
  ogTitle: 'Homepage',
  ogDescription: 'Discover the world of Chinese or Korean dramas with us! Dive into captivating stories, explore a community of fans, and find everything you need to start your dramas journey.',
  description: 'Discover the world of Chinese or Korean dramas with us! Dive into captivating stories, explore a community of fans, and find everything you need to start your dramas journey.',
  ogImage: '/open-graph.png',
  ogUrl: `${import.meta.env.VITE_BASE_URL}`,
  keywords: ['chinese drama', 'cdrama', 'c-drama', 'blog', 'blog post', 'news', 'information', 'chinese actress', 'chinese actor'].join(', '),
  twitterTitle: 'Homepage',
  twitterDescription: 'Discover the world of Chinese or Korean dramas with us! Dive into captivating stories, explore a community of fans, and find everything you need to start your dramas journey.',
  twitterImage: '/open-graph.png',
  twitterCard: 'summary'
})

</script>

<template>
  <header class="overflow-hidden">
    <Toaster />
    <nav class="relative border-b border-b-muted dark:border-b-gray-800 shadow-md">
      <div class="container mx-auto px-2 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <a href="/" class="flex-shrink-0">
              <h1 class="text-cyan-500 font-bold text-2xl">Miju<span class="text-black dark:text-white">Blog</span></h1>
            </a>
            <div class="hidden min-[877px]:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <a
                  v-for="item in navigation"
                  :key="item.title"
                  :href="item.path"
                  class="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                >
                  {{ item.title }}
                </a>
              </div>
            </div>
          </div>
          <div class="">
            <div class="ml-4 flex items-center min-[877px]:ml-6">
              <SearchBar class="mr-1 min-[877px]:mr-4 hidden min-[877px]:block" />
              <WriteButton class="mr-1 min-[877px]:mr-4" />
              <SwitchTheme class="mr-1 min-[877px]:mr-4 hidden min-[877px]:block" />
              <NuxtLink to="/me/notifications" class="relative mr-1 min-[877px]:mr-4">
                <button 
                  class="p-2 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Bell class="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </button>
                <transition
                  enter-active-class="transform ease-out duration-300 transition"
                  enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                  enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
                  leave-active-class="transition ease-in duration-100"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                >
                  <span 
                    v-if="notificationCount > 0"
                    class="absolute -top-0 -right-0.5 flex items-center justify-center min-w-[18px] h-4 px-1 text-xs font-bold text-white bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800"
                  >
                    {{ notificationCount }}
                  </span>
                </transition>
              </NuxtLink>
              <ProfileAvatar />
              <div class="-mr-2 flex min-[877px]:hidden">
                <ClientOnly>
                  <button
                    @click="menuState = !menuState"
                    class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                  >
                    <span class="sr-only">Open main menu</span>
                    <MobileMenuButton :menu-state="menuState" />
                  </button>
                </ClientOnly>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <Transition
      enter-active-class="transition ease-out duration-200 transform"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150 transform"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <NavigationMenu :navigation="navigation" :menu-state="menuState"/>
    </Transition>
    <slot />
  </header>
</template>

<style scoped>
.router-link-active {
  @apply text-cyan-500 dark:text-cyan-400;
}
</style>