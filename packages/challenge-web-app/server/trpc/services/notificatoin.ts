import { $Enums } from '@prisma/client';
import prisma from '~~/lib/prisma';

type NotificationProps = {
   type: $Enums.NotificationType;
   title: string;
   content: string;
   userId: string;
};

const sendNotification = async (props: NotificationProps) => {
   const { type, title, content, userId } = props;

   const result = await prisma.notification.create({
      data: {
         type,
         title,
         content,
         userId,
      },
   });
   notificationEmitter.emit('new', { userIds: new Set([userId]) });

   return result;
};

const groupSendNotification = async (
   props: Omit<NotificationProps, 'userId'> & { userIds: string[] }
) => {
   const { type, title, content, userIds } = props;

   const notifications = userIds.map((userId) => ({
      type,
      title,
      content,
      userId,
   }));

   const result = await prisma.notification.createMany({
      data: notifications,
   });
   notificationEmitter.emit('new', { userIds: new Set(userIds) });

   return result;
};

export const notificationSerivce = {
   sendNotification,
   groupSendNotification,
};
