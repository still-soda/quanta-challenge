import {
   activateAutoInsertion,
   activateMarkers,
   registerProviders,
} from '@volar/monaco';
import * as languageConfigs from './language-configs';
import type { MonacoEditor } from '.';

// 导入 worker 文件
import vueWorkerUrl from './vue.worker?worker&url';
import jsonWorkerUrl from 'monaco-editor/esm/vs/language/json/json.worker?worker&url';
// import cssWorkerUrl from 'monaco-editor/esm/vs/language/css/css.worker?worker&url';
// import htmlWorkerUrl from 'monaco-editor/esm/vs/language/html/html.worker?worker&url';
// import tsWorkerUrl from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker&url';
import editorWorkerUrl from 'monaco-editor/esm/vs/editor/editor.worker?worker&url';

const createWorker = async (workerPath: string) => {
   return new Worker(workerPath, { type: 'module' });
};

export const registerLanguageWorkers = (monaco: MonacoEditor) => {
   self.MonacoEnvironment = {
      getWorker: async (_, label) => {
         if (label === 'json') {
            return await createWorker(jsonWorkerUrl);
         }
         if (
            label === 'vue' ||
            label === 'typescript' ||
            label === 'javascript' ||
            label === 'css' ||
            label === 'scss' ||
            label === 'less' ||
            label === 'html'
         ) {
            return await createWorker(vueWorkerUrl);
         }
         return await createWorker(editorWorkerUrl);
      },
   };

   monaco.languages.setLanguageConfiguration(
      'vue',
      languageConfigs.vue(monaco)
   );
   monaco.languages.setLanguageConfiguration(
      'javascript',
      languageConfigs.js(monaco)
   );
   monaco.languages.setLanguageConfiguration(
      'typescript',
      languageConfigs.ts(monaco)
   );
   monaco.languages.setLanguageConfiguration(
      'css',
      languageConfigs.css(monaco)
   );
   monaco.languages.setLanguageConfiguration(
      'html',
      languageConfigs.html(monaco)
   );

   monaco.languages.register({
      id: 'vue',
      extensions: ['.vue'],
   });
   const worker = monaco.editor.createWebWorker({
      moduleId: 'vs/language/vue/vueWorker',
      label: 'vue',
   });

   const languageId = [
      'vue',
      'javascript',
      'typescript',
      'javascriptreact',
      'typescriptreact',
      'html',
      'css',
      'json',
   ];

   const getSyncUris = () => {
      const res = monaco.editor.getModels().map((model) => model.uri);
      return res;
   };

   // @ts-ignore
   activateMarkers(worker, languageId, 'vue', getSyncUris, monaco.editor);
   // @ts-ignore
   activateAutoInsertion(worker, languageId, getSyncUris, monaco.editor);
   // @ts-ignore
   registerProviders(worker, languageId, getSyncUris, monaco.languages);

   const vueShimDts = `
    declare module '*.vue' {
        import type { DefineComponent } from 'vue'
        const component: DefineComponent<{}, {}, any>
        export default component
    }`;
   monaco.languages.typescript.typescriptDefaults.addExtraLib(
      vueShimDts,
      'file:///node_modules/vue-shim.d.ts'
   );
};
