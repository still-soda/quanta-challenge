import dayjs from 'dayjs';
import prisma from '~~/lib/prisma';

const countContinuesCheckin = async (userId: string) => {
   const month = dayjs().startOf('month');
   let count = 0;

   const checkins = await prisma.dailyCheckin.findMany({
      where: {
         userId,
         date: { gte: month.toDate() },
      },
      orderBy: { date: 'desc' },
   });

   for (let i = 0; i < checkins.length; i++) {
      const checkinDay = dayjs(checkins[i].date);
      if (i === 0) {
         const [today, yesterday] = [dayjs(), dayjs().subtract(1, 'day')];
         if (
            checkinDay.isSame(today, 'day') ||
            checkinDay.isSame(yesterday, 'day')
         ) {
            count++;
         } else {
            break;
         }
      } else {
         const prevCheckinDay = dayjs(checkins[i - 1].date);
         if (checkinDay.isSame(prevCheckinDay.subtract(1, 'day'), 'day')) {
            count++;
         } else {
            break;
         }
      }
   }

   return count;
};

export const dailyService = {
   countContinuesCheckin,
};
