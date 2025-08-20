import { init, parse } from 'es-module-lexer';

export abstract class DependencyDtsFileLoader {
   constructor(private moduleBase = 'node_modules') {}

   abstract readFile(filePath: string): Promise<string>;

   abstract readDir(dirPath: string): Promise<string[]>;

   private join(...path: string[]) {
      const segmentA: string[] = [];
      const segmentB: string[] = path.flatMap((s) =>
         s.split('/').filter(Boolean)
      );
      segmentB.forEach((s) => {
         if (s === '.') {
            return;
         } else if (s === '..') {
            segmentA.length === 0 || segmentA[segmentA.length - 1] === '..'
               ? segmentA.push('..')
               : segmentA.pop();
         } else {
            segmentA.push(s);
         }
      });
      return segmentA.join('/');
   }

   private getDepsVersion(pkgsJson: Record<string, any>): Map<string, string> {
      const deps = pkgsJson.dependencies || {};
      const devDeps = pkgsJson.devDependencies || {};
      const allDeps = { ...deps, ...devDeps };
      return new Map(Object.entries(allDeps));
   }

   private async getImports(script: string) {
      await init;
      const [imports] = parse(script);
      return imports.map((i) => i.n).filter((i) => typeof i !== 'undefined');
   }

   private getDir(path: string) {
      return path.slice(0, path.lastIndexOf('/'));
   }

   moduleDtsEntries = new Map<string, string>();

   private async loadModule(moduleName: string) {
      const pkgJsonPath = this.join(
         this.moduleBase,
         moduleName,
         'package.json'
      );
      let json: Record<string, any>;
      try {
         const pkgJsonContent = await this.readFile(pkgJsonPath);
         json = JSON.parse(pkgJsonContent);
      } catch {
         return false;
      }

      const exports = json.exports;
      if (!exports) return false;
      const types = Object.entries(exports)
         .map(([key, value]: any) => [
            key,
            typeof value?.import === 'object' ? value?.import : value,
         ])
         .map(([key, value]) => [key, value?.types])
         .filter(([_, value]) => Boolean(value))
         .map(([key, value]) => [
            this.join(moduleName, key),
            this.join(this.moduleBase, moduleName, value),
         ]);

      types.forEach(([key, value]: any) => {
         this.moduleDtsEntries.set(key, value);
      });

      if (!types.length) return true;

      const indexPrefix = this.join(this.moduleBase, moduleName, './index');
      const idxType = types.find(([_, path]) => path?.startsWith(indexPrefix));
      if (idxType) {
         const dtsPath = idxType[1]!;
         const dtsContent = await this.readFile(dtsPath);
         const indexDts = `declare module '${moduleName}' { ${dtsContent} }`;
         this.seenContents.set(dtsPath, indexDts);
      } else {
         const indexDts = types
            .map(([key, value]: any) => {
               return `declare module '${key}' { export * from '${value}'; }`;
            })
            .join('\n');
         const dtsPath = this.join(this.moduleBase, moduleName, 'index.d.ts');
         this.seenContents.set(dtsPath, indexDts);
      }

      return true;
   }

   private getJsExtLength(path: string) {
      if (path.endsWith('.js')) {
         return 3;
      } else if (path.endsWith('.cjs') || path.endsWith('.mjs')) {
         return 4;
      }
      return 0;
   }

   private seenPaths = new Set<string>();
   private seenContents = new Map<string, string>();

   private async recursiveLoadModuleDeps(entry: string, base = '') {
      if (entry.endsWith('*')) {
         const dir = this.join(this.moduleBase, entry.slice(0, -1));
         const files = (await this.readDir(dir)).filter(
            (file) =>
               file.endsWith('.d.ts') ||
               file.endsWith('.d.cts') ||
               file.endsWith('.d.mts')
         );
         for (const file of files) {
            await this.recursiveLoadModuleDeps(`./${file}`, dir);
         }
         return;
      }

      let entryPath: string;
      if (entry.startsWith('./') || entry.startsWith('../')) {
         entryPath = this.join(base, entry);
      } else if (entry.startsWith('/')) {
         entryPath = entry;
      } else {
         const segments = entry.split('/');
         for (let i = 0; i < segments.length; i++) {
            const name = segments.slice(0, i + 1).join('/');
            entryPath = this.join(this.moduleBase, name);
            await this.loadModule(name);
            if (this.moduleDtsEntries.has(entry)) break;
         }
         entryPath = this.moduleDtsEntries.get(entry)!;
         if (!entryPath) return;
      }

      if (this.seenPaths.has(entryPath)) {
         return;
      }
      this.seenPaths.add(entryPath);

      let entryContent: string;
      try {
         entryContent = await this.readFile(entryPath);
      } catch {
         return;
      }
      !this.seenContents.has(entryPath) &&
         this.seenContents.set(entryPath, entryContent);
      const imports = await this.getImports(entryContent);
      const transformedImports = imports.map((imp) => {
         const len = this.getJsExtLength(imp);
         return len ? `${imp.slice(0, -len)}.d.ts` : imp;
      });

      await Promise.all(
         transformedImports.map((imp) =>
            this.recursiveLoadModuleDeps(imp, this.getDir(entryPath))
         )
      );
   }

   async loadDependencies(pkgsJson: Record<string, any>) {
      const depsVersion = this.getDepsVersion(pkgsJson);
      const deps = Array.from(depsVersion.keys());
      this.seenPaths = new Set<string>();

      await Promise.all(deps.map((dep) => this.loadModule(dep)));
      await Promise.all(
         Array.from(this.moduleDtsEntries.keys()).map((dep) =>
            this.recursiveLoadModuleDeps(dep)
         )
      );

      const pathContentMap = Object.fromEntries(this.seenContents.entries());
      this.seenContents.clear();
      this.seenPaths.clear();

      return { pathContentMap };
   }
}
