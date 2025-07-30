import prisma from '@challenge/database';
import { protectedProcedure } from '../../protected-trpc';
import { publicProcedure, router } from '../../trpc';
import z from 'zod';
import * as serverAuthn from '@simplewebauthn/server';

const RegisterAuthnSchema = z.object({
   email: z.email(),
});

const registerAuthnProcedure = protectedProcedure
   .input(RegisterAuthnSchema)
   .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.user;
      const { email } = input;

      const user = await prisma.user.findUniqueOrThrow({
         where: {
            id: userId,
         },
         include: {
            WebAuthnCredential: true,
         },
      });
      if (user.email) {
         if (user.email !== email) {
            throw new Error('Email already registered');
         }
      } else {
         await prisma.user.update({
            where: { id: userId },
            data: { email },
         });
      }

      const options = await serverAuthn.generateRegistrationOptions({
         rpID: 'localhost',
         rpName: 'Quanta Challenge',
         userName: user.name!,
         attestationType: 'none',
         excludeCredentials: user.WebAuthnCredential.map((cred) => ({
            id: cred.id,
         })),
      });

      const redis = useRedis();
      await redis.set('webauthn:register:' + userId, JSON.stringify(options));

      return options;
   });

const VerifyRegistrationSchema = z.looseObject({
   id: z.string(),
   rawId: z.string(),
});

const verifyAuthnRegistrationProcedure = protectedProcedure
   .input(VerifyRegistrationSchema)
   .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.user;

      const redis = useRedis();
      const optionsJSON = await redis.get('webauthn:register:' + userId);
      if (!optionsJSON) {
         throw new Error('No registration options found');
      }
      redis.del('webauthn:register:' + userId);

      const options: serverAuthn.PublicKeyCredentialCreationOptionsJSON =
         JSON.parse(optionsJSON);

      const verification = await serverAuthn.verifyRegistrationResponse({
         response: input as any,
         expectedChallenge: options.challenge,
         expectedOrigin: 'http://localhost:3000',
         expectedRPID: 'localhost',
      });

      const { registrationInfo } = verification;
      if (!verification.verified || !registrationInfo) {
         throw new Error('WebAuthn registration verification failed');
      }

      const { credential } = registrationInfo;
      await prisma.webAuthnCredential.create({
         data: {
            publicKey: Buffer.from(credential.publicKey).toString('base64'),
            id: credential.id,
            counter: credential.counter,
            transport: credential.transports?.join(';'),
            user: {
               connect: {
                  id: userId,
               },
            },
         },
      });

      return generateTokens({ userId });
   });

const AuthenticateAuthnSchema = z.object({
   email: z.email(),
});

const authenticateAuthnProcedure = publicProcedure
   .input(AuthenticateAuthnSchema)
   .mutation(async ({ input }) => {
      const { email } = input;

      const user = await prisma.user.findUniqueOrThrow({
         where: { email },
         include: { WebAuthnCredential: true },
      });

      if (user.WebAuthnCredential.length === 0) {
         throw new Error('No WebAuthn credentials found for this user');
      }

      const options = await serverAuthn.generateAuthenticationOptions({
         rpID: 'localhost',
         allowCredentials: user.WebAuthnCredential.map((cred) => ({
            id: cred.id,
            transports: (cred.transport?.split(';') ||
               []) as serverAuthn.AuthenticatorTransport[],
            type: 'public-key',
         })),
      });

      const redis = useRedis();
      await redis.set(
         'webauthn:authenticate:' + email,
         JSON.stringify(options)
      );

      return options;
   });

const VerifyAuthenticationSchema = z.object({
   accessResponse: z.looseObject({
      id: z.string(),
      rawId: z.string(),
   }),
   email: z.email(),
});

const verifyAuthnAuthenticationProcedure = publicProcedure
   .input(VerifyAuthenticationSchema)
   .mutation(async ({ input }) => {
      const redis = useRedis();
      const { accessResponse, email } = input;
      const optionsJSON = await redis.get('webauthn:authenticate:' + email);
      if (!optionsJSON) {
         throw new Error('No authentication options found');
      }
      redis.del('webauthn:authenticate:' + email);

      const options: serverAuthn.PublicKeyCredentialRequestOptionsJSON =
         JSON.parse(optionsJSON);

      const credential = await prisma.webAuthnCredential.findFirstOrThrow({
         where: {
            id: accessResponse.id,
         },
      });

      const verification = await serverAuthn.verifyAuthenticationResponse({
         response: accessResponse as any,
         expectedChallenge: options.challenge,
         expectedOrigin: 'http://localhost:3000',
         expectedRPID: 'localhost',
         requireUserVerification: true,
         credential: {
            id: credential.id,
            publicKey: Buffer.from(credential.publicKey, 'base64'),
            counter: credential.counter,
         },
      });

      if (!verification.verified) {
         throw new Error('WebAuthn authentication verification failed');
      }

      const user = await prisma.user.findUniqueOrThrow({
         where: { email },
         select: { id: true },
      });

      return generateTokens({ userId: user.id });
   });

export const authnRouter = router({
   register: registerAuthnProcedure,
   verifyRegistration: verifyAuthnRegistrationProcedure,
   authenticate: authenticateAuthnProcedure,
   verifyAuthentication: verifyAuthnAuthenticationProcedure,
});
