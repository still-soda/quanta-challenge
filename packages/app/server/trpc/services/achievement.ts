import { tracker } from '~~/lib/prisma';
import { AchievementObserver } from './utils/achievement-observer';
import { requestContext } from '../context';

const observer = AchievementObserver.instance;

observer.observe(tracker);

observer.useVarsInjector(() => {
   const ctx = requestContext.getStore();
   const userId = ctx?.userId;
   return { userId };
});

observer.addListener('check', (id, achieved) => {});

export const achievementService = {
   get observer() {
      return observer;
   },
};
