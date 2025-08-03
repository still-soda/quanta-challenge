import { Singleton } from '../utils/singleton.js';
import IORedis from 'ioredis';

const env = (key: string, defaultValue: string): string => {
   return process.env[key] || defaultValue;
};

export class RedisService extends Singleton {
   static get instance() {
      return super.getInstance<RedisService>();
   }

   private constructor(
      public readonly host = env('REDIS_HOST', 'localhost'),
      public readonly port = parseInt(env('REDIS_PORT', '6379'), 10),
      public readonly password = env('REDIS_PASSWORD', ''),
      public readonly redis: IORedis.Redis
   ) {
      super();
      this.redis = new IORedis.Redis({
         host: this.host,
         port: this.port,
         password: this.password || undefined,
      });
   }

   destroy() {
      this.redis.disconnect();
   }
}
