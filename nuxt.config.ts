// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  components: [
    {
      path: "~/components",
      pathPrefix: false,
      global: true,
    },
  ],
  experimental: {
    renderJsonPayloads: false,
  },
  image: {
    provider: 'netlify',
  },
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    "@nuxt/image",
    "@vueuse/motion/nuxt",
    "@nuxtjs/supabase",
    "nuxt-icon",
    "@nuxt/icon",
    "vue3-perfect-scrollbar/nuxt",
    "@stefanobartoletti/nuxt-social-share",
    [
      "@nuxtjs/sitemap",
      {
        hostname: process.env.VITE_BASE_URL,
        sources: [
          `${process.env.VITE_BASE_URL || 'http://localhost:3000'}/api/sitemap/urls`,
        ]
      },
    ],
    [
      "@nuxtjs/robots",
      {
        rules: {
          UserAgent: "*",
          Allow: "/",
          Disallow: ["/settings", "/me"],
          Sitemap: process.env.VITE_BASE_URL + "/sitemap.xml",
        }
      },
    ],
    [
      "nuxt-mail",
      {
        message: {
          to: process.env.SMTP_USER,
        },
        smtp: {
          host: process.env.SMTP_HOST,
          port: 587,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        },
      },
    ],
  ],
  icon: {
    size: "24px", // default <Icon> size applied
    class: "icon", // default <Icon> class applied
    mode: "css", // default <Icon> mode applied
    aliases: {
      nuxt: "NuxtIcon",
    },
  },
  supabase: {
    redirect: false,
  },
  shadcn: {
    componentDir: "./components/ui",
  },
  colorMode: {
    preference: "system", // default value of $colorMode.preference
    fallback: "dark",
    classPrefix: "",
    storage: "localStorage", // or 'sessionStorage' or 'cookie'
    storageKey: "nuxt-color-mode",
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL: process.env.EMAIL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    googleCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    public: {
      VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
      gtagId: process.env.gtagId,
      propertyId: process.env.propertyId,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      baseURL: process.env.APP_DOMAIN || "http://localhost:3000",
      motion: {
        directives: {
          "pop-bottom": {
            initial: {
              scale: 0,
              opacity: 0,
              y: 100,
            },
            visible: {
              scale: 1,
              opacity: 1,
              y: 0,
            },
          },
        },
      },
    },
  },
  app: {
    head: {
      title: "Homepage",
      titleTemplate: "%s - MijuBlog | (MB)",
      meta: [
        {
          name: "description",
          content:
            "Discover the world of Chinese or Korean dramas with us! Dive into captivating stories, explore a community of fans, and find everything you need to start your dramas journey.",
        },
      ],
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
    },
  },
  nitro: {
    plugins: ["~/server/cron/emailSchedule.ts"],
  },
});
