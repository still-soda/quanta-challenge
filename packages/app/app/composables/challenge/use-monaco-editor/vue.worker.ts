import { createNpmFileSystem } from '@volar/jsdelivr';
import { createTypeScriptWorkerLanguageService } from '@volar/monaco/worker';
import {
   createVueLanguagePlugin,
   getFullLanguageServicePlugins,
   resolveVueCompilerOptions,
} from '@vue/language-service';
import { initialize } from 'monaco-editor/esm/vs/editor/editor.worker';
import typescript, {
   type CompilerOptions,
   getDefaultCompilerOptions,
   ModuleResolutionKind,
   ScriptTarget,
} from 'typescript';
import { URI } from 'vscode-uri';

import type { LanguageServiceEnvironment } from '@volar/monaco/worker';
import type * as monaco from 'monaco-editor';

self.onmessage = () => {
   initialize((ctx: monaco.worker.IWorkerContext) => {
      const env: LanguageServiceEnvironment = {
         workspaceFolders: [URI.file('/')],
         fs: createNpmFileSystem(),
      };
      const asUri = (fileName: string) => URI.file(fileName);
      const asFileName = (uri: URI) => uri.fsPath;

      const compilerOptions = {
         ...getDefaultCompilerOptions(),
         target: ScriptTarget.ES2020,
         moduleResolution: ModuleResolutionKind.Bundler,
         strict: true,
      } satisfies CompilerOptions;
      const vueCompilerOptions = resolveVueCompilerOptions({});

      const languageService = createTypeScriptWorkerLanguageService({
         typescript,
         env,
         compilerOptions,
         uriConverter: { asFileName, asUri },
         workerContext: ctx,
         languagePlugins: [
            createVueLanguagePlugin(
               typescript,
               compilerOptions,
               vueCompilerOptions,
               asFileName
            ),
         ],
         languageServicePlugins: [...getFullLanguageServicePlugins(typescript)],
      });

      return languageService;
   });
};
