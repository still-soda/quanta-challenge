import prisma from '@challenge/database';
import { TRPCError } from '@trpc/server';
import pkg from 'node-sql-parser';
import { ValidPath } from '~~/lib/track-wrapper';
import { LRUMap } from '../../../utils/lru-map';
import { EventEmitter } from '../../../../app/utils/event-emitter';
import { VM } from 'vm2';

const { Parser } = pkg;

export interface IObservable<T> {
   subscribe: (
      callback: (
         path: { path: string; method: string }[]
      ) => Promise<void> | void
   ) => T;
}

export type AchivementObserverEvent = {
   dirty: [path: string];
   rebuild: [];
   check: [
      achievementId: number,
      result: {
         achieved: boolean;
         progress: number;
      },
      userId?: string,
      injectVars?: Record<string, any>
   ];
   query: [
      id: string,
      sql: string,
      hitCache: boolean,
      injectVars?: Record<string, any>
   ];
   error: [error: Error];
};

export type AchievementVarsInjector = () =>
   | Record<string, any>
   | Promise<Record<string, any>>;

export class AchievementObserver {
   constructor(
      private _useUserId: () => Promise<string | null> | string | null,
      private _maxCacheSize = process.env.ACHIEVEMENT_OBSERVER_MAX_CACHE_SIZE
         ? parseInt(process.env.ACHIEVEMENT_OBSERVER_MAX_CACHE_SIZE)
         : 1000,
      private _pathToQueries = new LRUMap<string, Set<string>>(
         this._maxCacheSize
      ),
      private _dirtyQueries = new Set<string>(),
      private _queryCache = new LRUMap<string, any>(this._maxCacheSize),
      private _parser = new Parser(),
      // field path -> loader id -> achievement id
      private _depTree = new Map<string, Map<number, number>>(),
      private _emitter = new EventEmitter<AchivementObserverEvent>(),
      private _injectors = new Set<AchievementVarsInjector>()
   ) {
      this.rebuildDepTree();
   }

   private async _executeQuery(sql: string) {
      return await prisma.$queryRawUnsafe(sql);
   }

   useVarsInjector(injector: AchievementVarsInjector) {
      this._injectors.add(injector);
      return () => this._injectors.delete(injector);
   }

   addListener<Event extends keyof AchivementObserverEvent>(
      event: Event,
      listener: (...args: AchivementObserverEvent[Event]) => void
   ) {
      return this._emitter.on(event, listener);
   }

   removeListener<Event extends keyof AchivementObserverEvent>(
      event: Event,
      listener: (...args: AchivementObserverEvent[Event]) => void
   ) {
      return this._emitter.off(event, listener);
   }

   private _affectedAchIds: Set<number> = new Set();
   private _injectVarsMap: Map<number, Record<string, any>> = new Map();

   private async _checkAchievement(
      achievementId: number,
      injectVars?: Record<string, any>
   ) {
      const userId = await this._useUserId();
      if (this._affectedAchIds.size === 0) {
         const flushJob = () => {
            const affectedAchIds = Array.from(this._affectedAchIds);
            const injectVarsMap = new Map(this._injectVarsMap);

            this._injectVarsMap.clear();
            this._affectedAchIds.clear();

            affectedAchIds.forEach((achId) => {
               this.triggerCheckAchievement(
                  achId,
                  userId ?? undefined,
                  injectVarsMap.get(achId)
               ).catch((err) => {
                  this._emitter.emit('error', err);
               });
            });
         };
         queueMicrotask(flushJob);
      }
      this._affectedAchIds.add(achievementId);
      if (injectVars) {
         const existingVars = this._injectVarsMap.get(achievementId) ?? {};
         this._injectVarsMap.set(achievementId, {
            ...existingVars,
            ...injectVars,
         });
      }
   }

   async observe<T>(target: IObservable<T>) {
      return target.subscribe(async (paths) => {
         for (const { path, method } of paths) {
            const pathToCheck = /^(create|delete).*/.test(method)
               ? path.split('.')[0]
               : path;

            const loaderMap = this._depTree.get(pathToCheck);
            if (loaderMap) {
               loaderMap.forEach((achId) => {
                  this._checkAchievement(achId);
               });
            }

            this._markDirtyByPath(pathToCheck as ValidPath);
         }
      });
   }

   manualMarkDirty(
      path: ValidPath | ValidPath[],
      injectVars?: Record<string, any>
   ) {
      const paths = Array.isArray(path) ? path : [path];
      paths.forEach((path) => {
         this._markDirtyByPath(path);

         const loaderMap = this._depTree.get(path);
         if (loaderMap) {
            loaderMap.forEach((achId) => {
               this._checkAchievement(achId, injectVars);
            });
         }
      });
   }

   private _markDirtyByPath(path: ValidPath) {
      const queries = this._pathToQueries.get(path);
      if (queries) {
         queries.forEach((q) => this._dirtyQueries.add(q));
      }
      this._emitter.emit('dirty', path);
   }

   private _matchedUsedContextVars(sql: string) {
      const pattern = /__ctx\.([a-zA-Z_]\w*)/g;
      const result = sql.matchAll(pattern);
      return Array.from(result).map((m) => m[1]);
   }

   private _injectCtxIntoSql(context: string, sql: string) {
      if (!context || context === '') return sql;

      const ctxCte = `__ctx AS (${context.trim()})`;

      const original = sql.trim();

      if (/^\s*WITH\s+RECURSIVE\b/i.test(original)) {
         const rest = original.replace(/^\s*WITH\s+RECURSIVE\b/i, '').trim();
         return `WITH RECURSIVE ${ctxCte}, ${rest}`;
      }

      if (/^\s*WITH\b/i.test(original)) {
         const rest = original.replace(/^\s*WITH\b/i, '').trim();
         return `WITH ${ctxCte}, ${rest}`;
      }

      return `WITH ${ctxCte}\n${original}`;
   }

   async runQuery(id: string, sql: string, injectVars?: Record<string, any>) {
      let queryId: string | null = id;
      let context = '';

      const injectPromises = Array.from(this._injectors).map(
         async (injector) => {
            const vars = await injector();
            injectVars ??= {};
            vars && typeof vars === 'object' && Object.assign(injectVars, vars);
         }
      );
      await Promise.all(injectPromises);

      if (injectVars) {
         const matchedVars = this._matchedUsedContextVars(sql).filter(
            (v) => v in injectVars!
         );
         if (matchedVars.length > 0) {
            queryId = null;
         }

         const entries = Object.entries(injectVars);
         if (entries.length > 0) {
            context = `SELECT ${Object.entries(injectVars)
               .filter(([, v]) => {
                  return ['string', 'number', 'boolean'].includes(typeof v);
               })
               .map(([k, v]) => {
                  v = typeof v === 'string' ? `'${v}'` : v;
                  return `${v} AS ${k}`;
               })
               .join(', ')}`;
         }
      }

      const columnList = this._parser.columnList(sql);
      const columnListSegments = columnList.map((col) => col.split('::'));

      if (columnListSegments.some(([o, t]) => o !== 'select' || t === 'null')) {
         const err = new TRPCError({
            code: 'BAD_REQUEST',
            message:
               'SQL 语句中只能包含 SELECT 操作，且列引用必须限定表名或表别名',
         });
         this._emitter.emit('error', err);
         throw err;
      }

      if (queryId) {
         columnListSegments.forEach(([, table, field]) => {
            const tableSet =
               this._pathToQueries.get(table) ??
               this._pathToQueries.set(table, new Set()).get(table)!;
            tableSet.add(queryId);

            const path = `${table}.${field}`;
            const queries =
               this._pathToQueries.get(path) ??
               this._pathToQueries.set(path, new Set()).get(path)!;
            queries.add(queryId);
         });
      }

      let result: any;
      const hitCache =
         !!queryId &&
         !this._dirtyQueries.has(queryId) &&
         this._queryCache.has(queryId);

      if (hitCache) {
         result = this._queryCache.get(queryId!);
      } else {
         const sqlWithCtx = this._injectCtxIntoSql(context, sql);
         const temp = (await this._executeQuery(sqlWithCtx)) as {
            __data: any;
         }[];
         result = temp.map((item) => item.__data);
         if (queryId) {
            this._queryCache.set(queryId, result);
            this._dirtyQueries.delete(queryId);
         }
      }
      this._emitter.emit('query', id, sql, hitCache, injectVars);
      return result as any[];
   }

   async rebuildDepTree() {
      const achievements = await prisma.achievement.findMany({
         select: {
            id: true,
            AchievementDependencyData: {
               select: {
                  achievementDepDataLoader: {
                     select: {
                        id: true,
                        sql: true,
                     },
                  },
               },
            },
         },
      });
      this._depTree.clear();

      achievements.forEach((ach) => {
         ach.AchievementDependencyData.forEach((dep) => {
            const loader = dep.achievementDepDataLoader;
            const columnList = this._parser.columnList(loader.sql);
            const columnListSegments = columnList.map((col) => col.split('::'));

            const invalid = columnListSegments.some(([o, t]) => {
               return o !== 'select' || t === 'null';
            });
            if (invalid) {
               const err = new TRPCError({
                  code: 'BAD_REQUEST',
                  message: `成就依赖的数据加载器（ID: ${loader.id}）的 SQL 语句中只能包含 SELECT 操作，且列引用必须限定表名或表别名`,
               });
               this._emitter.emit('error', err);
               throw err;
            }

            columnListSegments.forEach(([, table, field]) => {
               const path = `${table}.${field}`;

               const loaderMapFullPath =
                  this._depTree.get(path) ??
                  this._depTree.set(path, new Map()).get(path)!;
               loaderMapFullPath.set(loader.id, ach.id);

               const loaderMapTable =
                  this._depTree.get(table) ??
                  this._depTree.set(table, new Map()).get(table)!;
               loaderMapTable.set(loader.id, ach.id);
            });
         });
      });

      this._emitter.emit('rebuild');
   }

   async triggerCheckAchievement(
      achievementId: number,
      userId?: string,
      injectVars?: Record<string, any>
   ) {
      if (userId) {
         const userAchievement = await prisma.userAchievement.findUnique({
            where: {
               userId_achievementId: {
                  userId,
                  achievementId: achievementId,
               },
            },
         });
         if (userAchievement?.progress! >= 1) {
            // 已达成的成就不再重复检测
            return false;
         }
      }

      const achievement = await prisma.achievement.findUnique({
         where: { id: achievementId },
         select: {
            AchievementValidateScript: {
               select: {
                  script: true,
               },
            },
            AchievementDependencyData: {
               select: {
                  achievementDepDataLoader: {
                     select: {
                        id: true,
                        name: true,
                        type: true,
                        sql: true,
                        isList: true,
                     },
                  },
               },
            },
         },
      });
      const script = achievement?.AchievementValidateScript?.script;
      const loaders =
         achievement?.AchievementDependencyData.map(
            (d) => d.achievementDepDataLoader
         ) ?? [];

      if (!script) {
         const err = new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `成就（ID: ${achievementId}）的达成检测脚本未设置`,
         });
         this._emitter.emit('error', err);
         throw err;
      }

      const depDataPromises = loaders.map(async (loader) => {
         const result = await this.runQuery(
            `loader_${loader.id}`,
            loader.sql,
            injectVars
         );

         let parser: Function;
         switch (loader.type) {
            case 'NUMERIC':
               parser = (val: any) => Number(val);
               break;
            case 'BOOLEAN':
               parser = (val: any) => Boolean(val);
               break;
            case 'TEXT':
               parser = (val: any) => String(val);
               break;
            default:
               parser = (val: any) => val;
         }

         const parsedResult = result.map((item) => parser(item));
         const transformedResult = loader.isList
            ? parsedResult
            : parsedResult[0];

         return {
            name: loader.name,
            data: transformedResult as number | boolean | string,
         };
      });
      const depData = await Promise.all(depDataPromises);
      const depDataMap = depData.reduce((acc, cur) => {
         acc[cur.name] = cur.data;
         return acc;
      }, {} as Record<string, number | boolean | string>);

      const defineCheckFunc = (fn: Function) => fn;
      const checkScript = `${script.replace(
         'export default ',
         'const check = '
      )}; check(depData);`;
      try {
         const vm = new VM({
            timeout: 1000,
            sandbox: { depData: depDataMap, defineCheckFunc },
            allowAsync: false,
            eval: false,
            wasm: false,
         });
         const returned = vm.run(checkScript);
         const result: {
            achieved: boolean;
            progress: number;
         } = returned
            ? {
                 achieved: Boolean(returned.achieved),
                 progress: Number(returned.progress) || 0,
              }
            : {
                 achieved: false,
                 progress: 0,
              };
         this._emitter.emit('check', achievementId, result, userId, injectVars);
         return result;
      } catch (error) {
         const err =
            error instanceof TRPCError
               ? error
               : new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message:
                       '成就判定条件脚本执行失败: ' + (error as Error).message,
                 });
         this._emitter.emit('error', err);
         throw err;
      }
   }
}
