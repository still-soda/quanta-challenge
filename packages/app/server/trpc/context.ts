import type { H3Event } from 'h3';
import { ITokenPayload, verifyToken } from '../utils/jwt';

export const createContext = async (event: H3Event) => {
   const token = getHeader(event, 'Authorization')?.replace('Bearer ', '');
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
