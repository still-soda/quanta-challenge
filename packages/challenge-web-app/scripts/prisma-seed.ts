import prisma from '@challenge/database';
import { hashPassword } from '../server/utils/password.ts';

async function main() {
   await prisma.$connect();

   const account = process.env.SUPER_ACCOUNT || 'admin';
   const password = process.env.SUPER_PASSWORD || 'admin';
   const email = process.env.SUPER_EMAIL || 'admin@admin.com';
   const passwordHash = await hashPassword(password);

   const existingUser = await prisma.user.findUnique({
      where: { name: account },
   });

   if (existingUser) {
      console.log(
         `ℹ️ Admin user "${account}" already exists. Skipping seeding.`
      );
      return;
   }

   await prisma.user.upsert({
      where: { name: 'stillsoda' },
      update: {},
      create: {
         name: account,
         displayName: '超级管理员',
         role: 'SUPER_ADMIN',
         auths: {
            create: {
               provider: 'EMAIL',
               password: passwordHash,
               providerId: email,
            },
         },
      },
   });

   console.log(
      `✅ Seeded admin user:\n\n  - Account: ${account}\n  - Email: ${email}\n  - Password: ${password}\n`
   );
}

main()
   .catch((e) => {
      console.error('❌ Some Error happened when seeding the database.\n', e);
   })
   .finally(async () => {
      await prisma.$disconnect();
   });
