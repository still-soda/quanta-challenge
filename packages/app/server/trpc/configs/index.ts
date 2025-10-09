import { ValidFieldPath } from '@challenge/database';

export const invalidFieldsPattern: (ValidFieldPath | RegExp)[] = [
   /^auths.*/,
   /^achievements.*/, // 避免触发成就相关的循环依赖
];

export const contextVariables = ['userId', 'userRole', 'isAdmin', 'userName'];
