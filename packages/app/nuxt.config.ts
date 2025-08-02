import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
   compatibilityDate: '2025-07-15',
   devtools: { enabled: true },

   css: ['~/assets/css/tailwind.css'],
   vite: {
      plugins: [tailwindcss() as any],
      ssr: {
         noExternal: ['@prisma/client'], // 如果你确实要用 SSR 引入
      },
   },

   app: {
      pageTransition: {
         name: 'page',
         mode: 'out-in',
      },
   },

   prisma: {
      installStudio: false,
   },

   modules: ['@prisma/nuxt', 'shadcn-nuxt', '@pinia/nuxt', '@vueuse/nuxt'],

   nitro: {
      externals: {
         external: ['@prisma/client', '.prisma/client'],
      },
      devProxy: { host: '127.0.0.1' },
      preset: 'node-server',
      storage: {
         local: {
            driver: 'fs',
            base: './storage/local',
         },
      },
   },

   build: {
      transpile: ['trpc-nuxt', 'applicationinsights'],
   },

   runtimeConfig: {
      secret: {
         accessToken:
            process.env.ACCESS_TOKEN_SECRET || 'default_access_token_secret',
         refreshToken:
            process.env.REFRESH_TOKEN_SECRET || 'default_refresh_token_secret',
      },
      redis: {
         host: process.env.REDIS_HOST || 'localhost',
         port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
         password: process.env.REDIS_PASSWORD || '',
      },
   },
});
