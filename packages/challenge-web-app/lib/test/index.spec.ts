import { expect, test } from 'vitest';
import type prisma from '@challenge/database';
import { TrackWrapper, type AffectedPath } from '../track-wrapper';

const createTestPrisma = (): typeof prisma => {
   const tracker = new TrackWrapper();

   const handler: ProxyHandler<any> = {
      get(target, prop, receiver) {
         if (
            Object.prototype.hasOwnProperty.call(receiver, 'root') &&
            prop !== '$transaction'
         ) {
            return new Proxy({}, handler);
         }

         if (prop === '$transaction') {
            return (...args: any[]) => {
               if (typeof args[0] === 'function') {
                  const proxiedTx = new Proxy({ root: true }, handler);
                  const pathsList: AffectedPath[][] = [];
                  const off = tracker.subscribe((paths) => {
                     pathsList.push(paths);
                  });
                  return (args[0] as Function)
                     .call(target, proxiedTx)
                     .finally(() => off());
               }
               return Promise.all(args[0]);
            };
         }

         return new Proxy(() => {
            return new Promise((resolve) => {
               const off = tracker.subscribe((paths) => {
                  resolve(paths);
                  off();
               });
            });
         }, handler);
      },
   };
   const _prisma = new Proxy({ root: true }, handler);
   return tracker.wrap(_prisma);
};

test('Test create', async () => {
   const _prisma = createTestPrisma();
   const result = await _prisma.achievementDependencyDataRequestRecord.create({
      data: {
         userId: '',
         success: false,
         reason: '',
         sql: 'input.sql',
         name: 'input.name',
      },
   });
   expect(result).toBeDefined();
   expect(result).toEqual<AffectedPath[]>([
      {
         path: 'achievement_dependency_data_request_records.userId',
         method: 'create',
      },
      {
         path: 'achievement_dependency_data_request_records.success',
         method: 'create',
      },
      {
         path: 'achievement_dependency_data_request_records.reason',
         method: 'create',
      },
      {
         path: 'achievement_dependency_data_request_records.sql',
         method: 'create',
      },
      {
         path: 'achievement_dependency_data_request_records.name',
         method: 'create',
      },
   ]);
});

test('Test user update with nested avatar update', async () => {
   const _prisma = createTestPrisma();
   const result = await _prisma.user.update({
      where: { id: '' },
      data: {
         lastLogin: new Date(),
         avatar: {
            update: {
               Achievement: {
                  updateMany: {
                     where: { id: { gt: 0 } },
                     data: { name: 'new name' },
                  },
               },
            },
         },
      },
   });
   expect(result).toBeDefined();
   expect(result).toEqual<AffectedPath[]>([
      {
         path: 'users.lastLogin',
         method: 'update',
      },
      {
         path: 'achievements.name',
         method: 'updateMany',
      },
      {
         path: 'images.Achievement',
         method: 'update',
      },
      {
         path: 'users.avatar',
         method: 'update',
      },
   ]);
});

test('Test user createMany', async () => {
   const _prisma = createTestPrisma();
   const result = await _prisma.user.createMany({
      data: [
         { id: '1', name: 'name1' },
         { id: '2', name: 'name2' },
         { id: '3', name: 'name3' },
      ],
   });
   expect(result).toBeDefined();
   expect(result).toEqual<AffectedPath[]>([
      {
         path: 'users.id',
         method: 'createMany',
      },
      {
         path: 'users.name',
         method: 'createMany',
      },
   ]);
});

test('Test user update with nested avatar updateMany and createMany', async () => {
   const _prisma = createTestPrisma();
   const result = await _prisma.user.update({
      where: { id: '' },
      data: {
         name: 'Hello',
         avatar: {
            update: {
               Achievement: {
                  updateMany: {
                     where: { id: { gt: 0 } },
                     data: {
                        name: 'new name',
                     },
                  },
                  createMany: {
                     data: {
                        name: 'new name',
                     },
                  },
               },
            },
         },
      },
   });
   expect(result).toBeDefined();
   expect(result).toEqual<AffectedPath[]>([
      {
         path: 'users.name',
         method: 'update',
      },
      {
         path: 'achievements.name',
         method: 'updateMany',
      },
      {
         path: 'achievements.name',
         method: 'createMany',
      },
      {
         path: 'images.Achievement',
         method: 'update',
      },
      {
         path: 'users.avatar',
         method: 'update',
      },
   ]);
});

test('Test auth deleteMany', async () => {
   const _prisma = createTestPrisma();
   const result = await _prisma.auth.deleteMany({
      where: {
         userId: '',
      },
   });
   expect(result).toBeDefined();
   expect(result).toEqual<AffectedPath[]>([
      {
         path: 'auths',
         method: 'deleteMany',
      },
   ]);
});

test('Test user upsert', async () => {
   const _prisma = createTestPrisma();
   const result = await _prisma.user.upsert({
      where: { id: '' },
      create: {
         id: '',
         name: 'name',
      },
      update: {
         name: 'new name',
      },
   });
   expect(result).toBeDefined();
   expect(result).toEqual<AffectedPath[]>([
      {
         path: 'users.id',
         method: 'create',
      },
      {
         path: 'users.name',
         method: 'create',
      },
      {
         path: 'users.name',
         method: 'update',
      },
   ]);
});

test('Test user update with avatar Achievement connect', async () => {
   const _prisma = createTestPrisma();
   const result = await _prisma.user.update({
      where: { id: '' },
      data: {
         name: 'Hello',
         avatar: {
            update: {
               Achievement: {
                  connect: {
                     id: 1,
                  },
               },
            },
         },
      },
   });
   expect(result).toBeDefined();
   expect(result).toEqual<AffectedPath[]>([
      {
         path: 'users.name',
         method: 'update',
      },
      {
         path: 'images.Achievement',
         method: 'update',
      },
      {
         path: 'users.avatar',
         method: 'update',
      },
   ]);
});

test('Test auth deleteMany', async () => {
   const _prisma = createTestPrisma();
   const result = await _prisma.auth.deleteMany({
      where: {
         userId: '',
      },
   });
   expect(result).toBeDefined();
   expect(result).toEqual<AffectedPath[]>([
      {
         path: 'auths',
         method: 'deleteMany',
      },
   ]);
});

test('Test transcation list', async () => {
   const _prisma = createTestPrisma();
   const result = await _prisma.$transaction([
      _prisma.user.update({
         where: { id: '' },
         data: {
            name: 'Hello',
         },
      }),
      _prisma.auth.deleteMany({
         where: {
            userId: '',
         },
      }),
   ]);
   const flattened = result.flat();
   expect(flattened).toBeDefined();
   expect(flattened).toEqual<AffectedPath[]>([
      { path: 'users.name', method: 'update' },
      { path: 'auths', method: 'deleteMany' },
   ]);
});

test('Test transcation with callback', async () => {
   const _prisma = createTestPrisma();
   const result = await _prisma.$transaction(async (tx) => {
      const r1 = await tx.user.update({
         where: { id: '' },
         data: {
            name: 'Hello',
         },
      });
      const r2 = await tx.auth.deleteMany({
         where: {
            userId: '',
         },
      });
      return [r1, r2];
   });
   const flattened = result.flat();
   expect(flattened).toBeDefined();
   expect(flattened).toEqual<AffectedPath[]>([
      { path: 'users.name', method: 'update' },
      { path: 'auths', method: 'deleteMany' },
   ]);
});
