import type { WebContainer } from '@webcontainer/api';
import { DependencyDtsFileLoader } from './deps-loader';

class WebContainerDepsLoader extends DependencyDtsFileLoader {
   constructor(moduleBase: string, private readonly instance: WebContainer) {
      super(moduleBase);
   }
   override readFile(filePath: string): Promise<string> {
      return this.instance.fs.readFile(filePath, 'utf-8');
   }
   override readDir(dirPath: string): Promise<string[]> {
      return this.instance.fs.readdir(dirPath);
   }
}

export interface IUseDepsLoaderOptions {
   getInstance: () => Promise<WebContainer> | WebContainer;
   moduleBase: string;
}

export const useDepsLoader = (options: IUseDepsLoaderOptions) => {
   const instancePromise = Promise.try(options.getInstance);
   const nodeModulesBase = `${options.moduleBase}/node_modules`;
   const depsLoaderPromise = instancePromise.then(
      (instance) => new WebContainerDepsLoader(nodeModulesBase, instance)
   );

   const load = async () => {
      const entryPath = options.moduleBase;
      const instance = await instancePromise;
      const pkgJsonPath = `${entryPath}/package.json`;
      const pkgJsonText = await instance.fs.readFile(pkgJsonPath, 'utf-8');

      let pkgJson: Record<string, any>;
      try {
         pkgJson = JSON.parse(pkgJsonText);
      } catch {
         throw new Error('Failed to parse package.json');
      }

      const depsLoader = await depsLoaderPromise;
      return depsLoader.loadDependencies(pkgJson);
   };

   return { load };
};
