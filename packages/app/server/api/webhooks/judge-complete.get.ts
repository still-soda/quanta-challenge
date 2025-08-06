import z from 'zod';

const JudgeCompleteSchema = z.object({
   token: z.uuid('Invalid token format'),
   judgeRecordId: z.number('Invalid judgeRecordId format').int(),
});

export default defineEventHandler(async (event) => {
   const query = getQuery(event);
   const parseResult = JudgeCompleteSchema.safeParse(query);
   if (!parseResult.success) {
      throw createError({
         statusCode: 400,
         message: 'Invalid request: ' + parseResult.error.message,
      });
   }

   const { token, judgeRecordId } = parseResult.data;
   const redis = useRedis();

   const storedToken = await redis.get(`judge_token:${judgeRecordId}`);
   if (storedToken !== token) {
      throw createError({
         statusCode: 403,
         message: 'Invalid token',
      });
   }
   await redis.del(`judge_token:${judgeRecordId}`);

   // TODO

   return { message: 'ok' };
});
