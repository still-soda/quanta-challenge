import Redis from 'ioredis';

let redis: Redis | null = null;

const initRedis = () => {
   const {
      redis: { host: redisHost, port: redisPort, password: redisPassword },
   } = useRuntimeConfig();
   if (!redisHost || !redisPort) {
      throw new Error('Redis host or port is not defined in runtime config');
   }

   redis = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword || undefined,
   });
};

export const useRedis = () => {
   if (!redis) {
      initRedis();
   }
   return redis!;
};
