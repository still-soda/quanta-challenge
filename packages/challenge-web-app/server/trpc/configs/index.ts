import { ValidFieldPath } from '@challenge/database';

export const invalidFieldsPattern: (ValidFieldPath | RegExp)[] = [
   /^auths.*/,
   /^achievement.*/, // 避免触发成就相关的循环依赖
   /^user_achievements.*/,
];

export const contextVariables = ['userId', 'continuesCheckinCount'];
