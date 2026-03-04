import nodemailer from 'nodemailer';
import { logger } from '~~/lib/logger';

const { account, smtpPassword } = useRuntimeConfig().email;
const transporter = nodemailer.createTransport({
   host: 'smtpdm.aliyun.com',
   port: 465,
   secure: true,
   auth: {
      user: account,
      pass: smtpPassword,
   },
});

export type SendEmailResult =
   | { success: true; id: string }
   | { success: false; reason: string };

/**
 * 发送邮件
 *
 * @param props 邮件发送参数，包括：
 * - `to`: 收件人邮箱地址
 * - `subject`: 邮件主题
 * - `html`: 邮件内容，支持 HTML 格式
 * - `from`: 发件人信息，可以是字符串（邮箱地址）或对象（包含 name 和 address）
 * @returns
 * - 成功时返回 `{ success: true; id: string }`，其中 `id` 是邮件发送成功后的唯一标识；
 * - 失败时返回 `{ success: false; reason: string }`，其中 `reason` 是错误原因描述。
 */
export const sendEmail = async (props: {
   to: string;
   subject: string;
   html: string;
   from?: { name?: string; address?: string } | string;
}): Promise<SendEmailResult> => {
   const { to, subject, html, from } = props;

   const result = await transporter.sendMail({
      from: formatEmailAddress(from ?? {}),
      to,
      subject,
      html,
   });

   logger.info({ to, result }, 'Email sent');

   if (result.messageId) {
      return {
         success: true,
         id: result.messageId,
      };
   } else {
      return {
         success: false,
         reason: result.rejected.join(', '),
      };
   }
};

const formatEmailAddress = (
   from: { name?: string; address?: string } | string,
) => {
   if (typeof from === 'string') {
      return from;
   }

   const {
      name = 'Quanta 前端挑战',
      address = 'noreply@challenge.quantacenter.com',
   } = from;
   return `"${name}" <${address}>`;
};
