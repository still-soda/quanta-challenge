import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
   compatibilityDate: '2025-07-15',
   devtools: { enabled: true },

   css: ['~/assets/css/tailwind.css'],
   vite: {
      plugins: [tailwindcss()],
   },

   modules: ['@prisma/nuxt', 'shadcn-nuxt', '@pinia/nuxt'],

   nitro: {
      externals: {
         external: ['@prisma/client', '.prisma/client'],
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
   },
});
