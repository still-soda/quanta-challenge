import { getVerificationCodeEmailTemplate } from '../templates/verification-code';

export default defineEventHandler(async () => {
   const result = await sendEmail({
      to: '951040628@qq.com',
      subject: '您的验证码：3724',
      html: getVerificationCodeEmailTemplate({
         code: '3724',
      }),
   });

   console.log(result);
   return 'email sent';
});
