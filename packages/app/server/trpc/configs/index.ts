import { ValidFieldPath } from '@challenge/database';

const validTables = ['users'];

export const whiteTableList = [`select::(.*)::(${validTables.join('|')})`];

export const invalidFieldsPattern: (ValidFieldPath | RegExp)[] = [/auths.*/];
