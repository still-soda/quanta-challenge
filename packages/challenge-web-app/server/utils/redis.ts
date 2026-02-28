import Redis from 'ioredis';

let redis: Redis | null = null;

const initRedis = () => {
   const {
      redis: { 
         host: redisHost, 
         port: redisPort, 
         password: redisPassword,
         username: redisUsername,
      },
   } = useRuntimeConfig();

   console.info('[INFO] Successfully get redis config', {
      host: redisHost,
      port: redisPort,
   });

   if (!redisHost || !redisPort) {
      throw new Error('Redis host or port is not defined in runtime config');
   }

   redis = new Redis({
      host: redisHost,
      port: redisPort,
      username: redisUsername || undefined,
      password: redisPassword || undefined,
   });
};

export const useRedis = () => {
   if (!redis) {
      initRedis();
   }
   return redis!;
};
