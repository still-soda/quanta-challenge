import { JudgeSuccessResultSchema } from '@challenge/judge-machine/schemas';
import type z from 'zod';

type ResultItem = z.infer<typeof JudgeSuccessResultSchema>['results'][number];

export type JudgeResults = Array<
   Omit<ResultItem, 'cacheFiles'> & {
      cacheFiles: Record<string, string>;
   }
>;
