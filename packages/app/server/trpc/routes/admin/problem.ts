import { protectedAdminProcedure } from '../../protected-trpc';
import { PublishSchema } from '../../schemas/publish-schema';
import { router } from '../../trpc';

const uploadProcedure = protectedAdminProcedure
   .input(PublishSchema)
   .mutation(async ({ ctx, input }) => {
      const { userId } = ctx.user;

      console.log(input);
   });

export const problemRouter = router({
   upload: uploadProcedure,
});
