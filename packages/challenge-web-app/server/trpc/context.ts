import type { H3Event } from 'h3';
import { ITokenPayload, verifyToken } from '../utils/jwt';
import { AsyncLocalStorage } from 'node:async_hooks';
import { logger } from '~~/lib/logger';

export const createContext = async (event: H3Event) => {
   const token = getCookie(event, 'quanta_access_token');
   const csrfToken = getCookie(event, 'quanta_csrf_token');
   const xCsrfToken = getHeader(event, 'x-csrf-token');
   const isServer = getHeader(event, 'x-ssr') === '1';

   if (!isServer) {
      if (!csrfToken || !xCsrfToken || csrfToken !== xCsrfToken) {
         return { event };
      }
   }

   if (!token) {
      return { event };
   }

   let user: ITokenPayload | null;
   try {
      user = verifyToken(token);
   } catch (error) {
      user = null;
   }

   return { event, user };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

export interface IRequestContextPayload {
   userId: string;
}

export const requestContext = new AsyncLocalStorage<IRequestContextPayload>();
