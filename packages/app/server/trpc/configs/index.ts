const validTables = ['users'];

export const whiteTableList = [`select::(.*)::(${validTables.join('|')})`];
