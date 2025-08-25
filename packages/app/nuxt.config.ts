import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
   compatibilityDate: '2025-07-15',
   devtools: { enabled: true },

   css: ['~/assets/css/tailwind.css'],
   vite: {
      plugins: [tailwindcss() as any],
      ssr: {
         noExternal: ['@prisma/client'],
      },
      worker: {
         format: 'es',
      },
      optimizeDeps: {
         exclude: ['monaco-editor'],
      },
      server: {
         headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Resource-Policy': 'cross-origin',
            'Access-Control-Allow-Origin': '*',
         },
      },
   },

   routeRules: {
      '/**': {
         security: {
            headers: {
               contentSecurityPolicy: {
                  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
               },
            },
         },
      },
      '/challenge/**': {
         security: {
            headers: {
               crossOriginOpenerPolicy: 'same-origin',
               crossOriginEmbedderPolicy: 'require-corp',
            },
         },
      },
      '/_nuxt/**': {
         security: {
            headers: {
               crossOriginOpenerPolicy: 'same-origin',
               crossOriginEmbedderPolicy: 'require-corp',
               crossOriginResourcePolicy: 'cross-origin',
            },
         },
      },
      '/_nuxt/**/*.js': {
         security: {
            headers: {
               crossOriginResourcePolicy: 'cross-origin',
            },
         },
      },
   },

   app: {
      pageTransition: {
         name: 'page',
         mode: 'out-in',
      },
      head: {
         meta: [{ name: 'referrer', content: 'origin-when-cross-origin' }],
      },
   },

   modules: ['@pinia/nuxt', '@vueuse/nuxt', 'nuxt-security'],

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
      judge: {
         serverUrl: process.env.JUDGE_SERVER || 'http://localhost:1888',
      },
   },
});
