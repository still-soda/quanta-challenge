import { UserRole } from '@prisma/client';
import jwt from 'jsonwebtoken';

export interface ITokenPayload {
   userId: string;
   role: UserRole;
}

/**
 * 生成双 token
 */
export const generateTokens = (payload: ITokenPayload) => {
   const { accessToken: accessSecret, refreshToken: refreshSecret } =
      useRuntimeConfig().secret;

   const refreshToken = jwt.sign(payload, refreshSecret, {
      algorithm: 'HS256',
      expiresIn: '7days',
   });
   const accessToken = jwt.sign(payload, accessSecret, {
      algorithm: 'HS256',
      expiresIn: '5s',
   });

   return { accessToken, refreshToken };
};

/**
 * 滑动续签 token
 */
export const renewTokens = (refreshToken: string) => {
   const { refreshToken: refreshSecret } = useRuntimeConfig().secret;

   try {
      const payload = jwt.verify(refreshToken, refreshSecret) as ITokenPayload;
      return generateTokens({
         role: payload.role,
         userId: payload.userId,
      });
   } catch (error) {
      throw new Error('Invalid or expired refresh token');
   }
};

/**
 * 验证 access token
 */
export const verifyToken = (accessToken: string) => {
   const { accessToken: accessSecret } = useRuntimeConfig().secret;
   try {
      return jwt.verify(accessToken, accessSecret) as ITokenPayload;
   } catch (error) {
      throw new Error('Invalid or expired access token');
   }
};
