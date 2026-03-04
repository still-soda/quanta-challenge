import z from 'zod';
import { getVerificationCodeEmailTemplate } from '~~/server/templates/verification-code';
import { logger } from '~~/lib/logger';
import { publicProcedure, router } from '../../trpc';
import { limitRequest } from '../../middlewares/limit-request';

// 发送邮箱验证码
const SendVerifyCodeSchema = z.object({
   email: z.email(),
});

const sendVerifyCodeProcedure = publicProcedure
   .use(limitRequest(10))
   .input(SendVerifyCodeSchema)
   .mutation(async ({ input }) => {
      const { email } = input;

      const verifyCode = Math.random().toString(10).slice(-4);
      const result = await sendEmail({
         to: email,
         subject: '您的验证码：' + verifyCode,
         html: getVerificationCodeEmailTemplate({
            code: verifyCode,
         }),
      });

      const redis = useRedis();
      redis.setex(`verify_code:${email}`, 15 * 60, verifyCode);

      logger.info(result);

      return result.success;
   });

export const verifyRoute = router({
   sendVerifyCode: sendVerifyCodeProcedure,
});
