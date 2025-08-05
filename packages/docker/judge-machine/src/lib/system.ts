import z from 'zod';
import type { Page } from 'playwright';
import { diff, Jimp } from 'jimp';

type BuildProxyProps<
   Mode extends 'pick' | 'omit',
   Target extends Record<string, any>,
   K extends keyof Target = keyof Target
> = Mode extends 'pick' ? Pick<Target, K> : Omit<Target, K>;

export const buildProxy = <
   Target extends Record<string, any>,
   Mode extends 'pick' | 'omit',
   K extends keyof Target = keyof Target
>(
   target: Target,
   props: K[],
   mode: Mode = 'pick' as Mode
): BuildProxyProps<Mode, Target, K> => {
   const keySet = new Set(props);
   const result = {} as BuildProxyProps<Mode, Target, K>;

   const shouldInclude =
      mode === 'pick'
         ? (key: string | symbol) => keySet.has(key as K)
         : (key: string | symbol) => !keySet.has(key as K);

   // 获取所有键（包括原型链上的可枚举属性）
   const allKeys = [
      ...Object.getOwnPropertyNames(target),
      ...Object.getOwnPropertySymbols(target),
      ...Object.getOwnPropertyNames(Object.getPrototypeOf(target) || {}),
   ].filter((key, index, arr) => arr.indexOf(key) === index); // 去重

   for (const key of allKeys) {
      if (shouldInclude(key)) {
         const value = target[key as keyof Target];
         if (typeof value === 'function') {
            // 绑定函数到原始对象
            (result as any)[key] = (...args: any[]) =>
               value.bind(target)(...args);
         } else {
            // 直接复制属性值
            (result as any)[key] = value;
         }
      }
   }

   return result;
};

const SaveImageSchema = z.object({
   type: z.literal('image'),
   buffer: z.instanceof(Buffer),
   name: z
      .string()
      .optional()
      .refine((val) => typeof val === 'undefined' || val.endsWith('.png')),
});

const SaveSchema = z.discriminatedUnion('type', [SaveImageSchema]);
type SaveType = z.infer<typeof SaveSchema>;

const generateUUID = () => {
   return crypto.randomUUID();
};

interface IDefineCheckPointCtx {
   score: {
      increment: (increment: number) => void;
      set: (value: number) => void;
      get: () => number;
   };
}

export class System {
   _checkPoints: Array<{
      name: string;
      totalScore: number;
      handler: (
         ctx: IDefineCheckPointCtx
      ) => Promise<number | void> | number | void;
   }> = [];

   files: Record<string, Buffer> = {};

   getAndCleanupFiles() {
      const files = this.files;
      this.files = {};
      return files;
   }

   constructor(
      public readonly mode: 'audit' | 'judge',
      public readonly info: Record<string, string> = {}
   ) {}

   async saveOrCompare(type: SaveType) {
      SaveSchema.parse(type);
      if (type.type === 'image') {
         const fn = this.mode === 'audit' ? this.saveImage : this.compareImage;
         return await fn.call(this, type.buffer, type.name as any);
      }
   }

   defineCheckPoint(
      name: string,
      totalScore: number,
      handler: (
         ctx: IDefineCheckPointCtx
      ) => Promise<number | void> | number | void
   ) {
      this._checkPoints.push({ name, totalScore, handler });
   }

   async expect(
      expression: any | (() => Promise<any> | any),
      desc: string = 'Expectation failed'
   ) {
      const result =
         typeof expression === 'function' ? await expression() : expression;
      if (!result) {
         throw new Error(`Expectation failed: ${desc}`);
      }
   }

   async compareImage(buffer: Buffer, name: `${string}.png`) {
      const templateImgUrl = this.info[name];
      const templateImage = await fetch(templateImgUrl).then((res) =>
         res.arrayBuffer()
      );

      const templateData = await Jimp.read(templateImage);
      const providedImage = await Jimp.read(buffer);
      const { percent } = diff(templateData, providedImage);

      return 1 - percent;
   }

   async saveImage(
      buffer: Buffer,
      name: `${string}.png` = `${generateUUID()}.png`
   ) {
      if (buffer.length > 5 * 1024 * 1024) {
         throw new Error('Image size exceeds 5MB limit');
      }
      this.files[name] = buffer;
      return 1; // 返回相似度 1 表示完全相同
   }

   async score(totalScore: number, rating: () => number) {
      const rate = rating();
      const score = Math.max(0, Math.min(rate, 1)) * totalScore;
      return score;
   }
}

const getExposeSystem = (sys: System) => {
   return {
      saveOrCompare: sys.saveOrCompare.bind(sys),
      score: sys.score.bind(sys),
      defineCheckPoint: sys.defineCheckPoint.bind(sys),
      expect: sys.expect.bind(sys),
   };
};

interface IHandlerCtx {
   page: ExposePage;
   $: ReturnType<typeof getExposeSystem>;
}

interface ITestResult {
   score: number;
   totalScore: number;
   details: string;
   status: 'pass' | 'fail';
   cacheFiles: Record<string, Buffer>;
}

export const getExposePage = (page: Page) => {
   return buildProxy(page, ['goto'], 'omit');
};
export type ExposePage = ReturnType<typeof getExposePage>;

export const defineTestHandler = (
   handler: (ctx: IHandlerCtx) => Promise<void>
) => {
   return async (page: Page, system: System) => {
      await handler({
         page,
         $: getExposeSystem(system),
      });
      const { _checkPoints } = system;
      system._checkPoints = [];
      const results: ITestResult[] = [];
      for (const checkPoint of _checkPoints) {
         let score = 0;
         try {
            const successScore = await checkPoint.handler({
               score: {
                  increment: (increment) => {
                     score += increment;
                  },
                  set: (value) => {
                     score = value;
                  },
                  get: () => score,
               },
            });
            score = successScore ?? score;
            results.push({
               score,
               totalScore: checkPoint.totalScore,
               details: `CheckPoint "${checkPoint.name}" scored ${score} out of ${checkPoint.totalScore}`,
               status: score === checkPoint.totalScore ? 'pass' : 'fail',
               cacheFiles: system.getAndCleanupFiles(),
            });
         } catch (error: any) {
            results.push({
               score,
               totalScore: checkPoint.totalScore,
               details: `CheckPoint "${checkPoint.name}" failed: ${error.message}`,
               status: 'fail',
               cacheFiles: system.getAndCleanupFiles(),
            });
         }
      }
      return {
         results,
         totalScore: results.reduce((sum, res) => sum + res.score, 0),
         maxScore: Math.max(...results.map((res) => res.score)),
         status: (results.every((res) => res.status === 'pass')
            ? 'pass'
            : 'fail') as 'pass' | 'fail',
      };
   };
};
