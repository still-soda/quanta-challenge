import type { MiddlewareHandler } from 'hono';
import dotenv from 'dotenv';

type Environment = NodeJS.ProcessEnv & {
   REDIS_HOST: string;
   REDIS_PORT: number;
   REDIS_PASSWORD: string;
   PORT: number;
};

export const loadEnv = (): MiddlewareHandler => {
   const { parsed: env } = dotenv.config();

   return async (c, next) => {
      c.env = env as Environment;
      await next();
   };
};
