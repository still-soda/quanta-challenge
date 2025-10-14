import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
   compatibilityDate: '2025-07-15',
   devtools: { enabled: true },

   experimental: {
      asyncContext: true,
   },

   css: ['~/assets/css/tailwind.css'],
   vite: {
      plugins: [tailwindcss() as any],
      ssr: {
         noExternal: ['@prisma/client', 'winston'],
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
         allowedHosts: ['host.docker.internal'],
      },
      resolve: {
         alias: {
            path: 'path-browserify',
         },
      },
   },

   security: {
      xssValidator: false,
      rateLimiter: false,
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
      experimental: {
         tasks: true,
      },
      scheduledTasks: {
         '0 0 * * *': 'db:update-rank-history',
      },
   },

   build: {
      transpile: ['trpc-nuxt', 'applicationinsights'],
   },

   runtimeConfig: {
      public: {
         appBaseUrl: import.meta.env.APP_SERVER || 'http://localhost:3000',
      },
      secret: {
         accessToken:
            import.meta.env.ACCESS_TOKEN_SECRET ||
            'default_access_token_secret',
         refreshToken:
            import.meta.env.REFRESH_TOKEN_SECRET ||
            'default_refresh_token_secret',
      },
      redis: {
         host: import.meta.env.REDIS_HOST || 'localhost',
         port: import.meta.env.REDIS_PORT
            ? parseInt(import.meta.env.REDIS_PORT)
            : 6379,
         password: import.meta.env.REDIS_PASSWORD || '',
      },
      judge: {
         serverUrl: import.meta.env.JUDGE_SERVER || 'http://localhost:1888',
      },
      rank: {
         problemCacheTTL: import.meta.env.PROBLEM_RANKING_CACHE_TTL
            ? parseInt(import.meta.env.PROBLEM_RANKING_CACHE_TTL)
            : 3600, // 默认缓存1小时
         globalCacheTTL: import.meta.env.GLOBAL_RANKING_CACHE_TTL
            ? parseInt(import.meta.env.GLOBAL_RANKING_CACHE_TTL)
            : 60, // 默认缓存1分钟
      },
   },
});
