import z from 'zod';

export const CompileSchema = z.object({
   code: z.string(),
});
