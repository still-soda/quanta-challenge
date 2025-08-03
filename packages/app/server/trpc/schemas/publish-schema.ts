import { Difficulty } from '@prisma/client';
import z from 'zod';

export const difficulties: Difficulty[] = [
   'easy',
   'medium',
   'hard',
   'very_hard',
] as const;

export const PublishSchema = z
   .object({
      title: z.string().min(1, 'Title is required'),
      detail: z.string().min(1, 'Detail is required'),
      tagIds: z.number().array().min(1, 'At least one tag is required'),
      judgeScript: z.string().nonempty('Judge script is required'),
      difficulty: z.enum(difficulties, { error: 'Invalid difficulty level' }),
      totalScore: z.number().min(1, 'Total score must be at least 1'),
      answerTemplateSnapshot: z.record(
         z.string(),
         z.string(),
         'Invalid answer template snapshot'
      ),
      referenceAnswerSnapshot: z
         .record(z.string(), z.string(), 'Invalid reference answer snapshot')
         .optional(),
      coverMode: z.enum(['default', 'custom']),
      coverImageId: z.string().optional(),
   })
   .refine(
      (data) => {
         return data.coverMode === 'default'
            ? Boolean(data.referenceAnswerSnapshot)
            : true;
      },
      {
         error: 'Reference answer snapshot is required when cover mode is default',
      }
   )
   .refine(
      (data) => {
         return data.coverMode === 'custom' ? Boolean(data.coverImageId) : true;
      },
      { error: 'Cover image id is required when cover mode is custom' }
   );
