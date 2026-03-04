import z from 'zod';
import type { IRule } from '~/components/st/Form/type';

/**
 * 修改密码参数验证规则
 */
export const changePasswordRules: Repeat<4, IRule> = [
   {
      field: 'email',
      required: true,
      validator: (value) => z.email().safeParse(value).success,
   },
   {
      field: 'verifyCode',
      required: true,
      validator: (value) =>
         z
            .string()
            .regex(/^\d{4}$/)
            .safeParse(value).success,
   },
   {
      field: 'newPassword',
      required: true,
      validator: (value, formdata) =>
         z.string().min(6).safeParse(value).success &&
         value === formdata['confirmPassword'],
   },
   {
      field: 'confirmPassword',
      required: true,
      validator: (value, formdata) =>
         z.string().min(6).safeParse(value).success &&
         value === formdata['newPassword'],
   },
] as const;
