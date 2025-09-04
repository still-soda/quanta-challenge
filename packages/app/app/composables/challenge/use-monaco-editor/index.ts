import type { editor } from 'monaco-editor';
import { createHighlighterCoreSync, createJavaScriptRegexEngine } from 'shiki';
import { shikiToMonaco } from '@shikijs/monaco';
import { registerLanguageWorkers } from './workers';
import * as editorActions from './editor-actions';
import { useEventEmitter } from '~/composables/utils/use-event-emitter';
import {
   defaultEditorOptions,
   editorThemeRegistration,
   langRegistrations,
   langs,
} from './config';

export type MonacoEditor = typeof import('monaco-editor');

const registerHighligher = (monaco: MonacoEditor) => {
   const highlighter = createHighlighterCoreSync({
      themes: [editorThemeRegistration],
      langs: langRegistrations,
      engine: createJavaScriptRegexEngine(),
   });
   langs.forEach((lang) => {
      monaco.languages.register({ id: lang });
   });
   shikiToMonaco(highlighter, monaco);
};

interface IUseMonacoEditorOptions {
   options?: editor.IStandaloneEditorConstructionOptions;
   getWorker?: (label: string) => Promise<Worker | undefined>;
}

type MonacoReadyCallback = (monaco: MonacoEditor) => void;
type EditorInstanceReadyCallback = (
   editor: editor.IStandaloneCodeEditor,
   monaco: MonacoEditor
) => void;
type EditorDisposedCallback = (editor: editor.IStandaloneCodeEditor) => void;

export const useMonacoEditor = (options?: IUseMonacoEditorOptions) => {
   const containerKey = 'monaco-editor-container';
   const container = useTemplateRef<HTMLDivElement>(containerKey);

   let monaco: MonacoEditor | null = null;
   let editorInstance: editor.IStandaloneCodeEditor | null = null;

   // 编辑器准备回调
   const monacoReadyCallbacks = new Set<MonacoReadyCallback>();
   const onMonacoReady = (callback: MonacoReadyCallback) => {
      if (monaco) {
         return callback(monaco);
      }
      monacoReadyCallbacks.add(callback);
   };

   // 编辑器实例准备回调
   const editorInstanceReadyCallbacks = new Set<EditorInstanceReadyCallback>();
   const onEditorInstanceReady = (callback: EditorInstanceReadyCallback) => {
      if (editorInstance && monaco) {
         return callback(editorInstance, monaco);
      }
      editorInstanceReadyCallbacks.add(callback);
   };

   // 编辑器销毁前回调
   const editorBeforeDisposedCallbacks = new Set<EditorDisposedCallback>();
   const onBeforeEditorDisposed = (callback: EditorDisposedCallback) => {
      editorBeforeDisposedCallbacks.add(callback);
   };

   // 使用文件系统创建模型
   const createModels = (fs: Record<string, string>) => {
      if (!monaco) {
         throw new Error('Monaco is not ready yet');
      }
      Object.entries(fs).forEach(([filePath, content]) => {
         if (monaco!.editor.getModel(monaco!.Uri.file(filePath))) {
            return;
         }
         monaco!.editor.createModel(
            content,
            void 0,
            monaco!.Uri.file(filePath)
         );
      });
   };

   // 监听特定模型内容修改
   type ContentChangeListener = (content: string) => void;
   const contentChangeListeners = new Map<string, Set<ContentChangeListener>>();
   const onModelSpecificContentChange = (
      path: string,
      callback: ContentChangeListener
   ) => {
      !contentChangeListeners.has(path) &&
         contentChangeListeners.set(path, new Set());
      contentChangeListeners.get(path)!.add(callback);
      return () => {
         contentChangeListeners.get(path)?.delete(callback);
      };
   };

   // 监听模型内容修改
   type GeneralContentChangeListener = (path: string, content: string) => void;
   const generalContentChangeListener = new Set<GeneralContentChangeListener>();
   const onModelContentChange = (callback: GeneralContentChangeListener) => {
      generalContentChangeListener.add(callback);
      return () => {
         generalContentChangeListener.delete(callback);
      };
   };

   // 监听模型切换
   const emitterKey = Symbol('editor-emitter');
   type ModelChangeEvent = { path: string };
   const { event } = useEventEmitter<ModelChangeEvent>(
      emitterKey,
      'model-change'
   );
   const onModelChange = (callback: (newPath: string) => void) => {
      watch(event, (event) => {
         event && callback(event.path);
      });
   };

   // 销毁模型
   const disposeModel = (filePath: string) => {
      if (!monaco) {
         throw new Error('Monaco is not ready yet');
      }
      const model = monaco.editor.getModel(monaco.Uri.file(filePath));
      model && model.dispose();
   };

   // 添加额外的类型文件
   const addExtraLibs = (dts: Record<string, string> | [string, string][]) => {
      if (!monaco) {
         throw new Error('Monaco is not ready yet');
      }
      const entries = Array.isArray(dts) ? dts : Object.entries(dts);
      entries.forEach(([filePath, content]) => {
         monaco!.languages.typescript.typescriptDefaults.addExtraLib(
            content,
            filePath
         );
      });
   };

   onMounted(async () => {
      if (!container.value) {
         throw new Error('Monaco editor container is not defined');
      }
      // 加载 Monaco 编辑器
      const monacoModule = await import('monaco-editor').catch((error) => {
         throw error;
      });
      monaco = monacoModule;
      monacoReadyCallbacks.forEach((callback) => callback(monaco!));

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
         target: monaco.languages.typescript.ScriptTarget.ES2020,
         allowNonTsExtensions: true,
         moduleResolution:
            monaco.languages.typescript.ModuleResolutionKind.NodeJs,
         module: monaco.languages.typescript.ModuleKind.ESNext,
         noEmit: true,
         esModuleInterop: true,
         jsx: monaco.languages.typescript.JsxEmit.React,
         allowJs: true,
         typeRoots: ['node_modules/@types'],
         paths: {
            '*': ['*', 'node_modules/*'], // 模块查找路径映射
         },
      });

      // 监听所有模型的修改
      monaco.editor.onDidCreateModel((model) => {
         model.onDidChangeContent(() => {
            const content = model.getValue();
            const path = model.uri.path;
            generalContentChangeListener.forEach((callback) =>
               callback(path, content)
            );
            contentChangeListeners
               .get(path)
               ?.forEach((callback) => callback(content));
         });
      });

      // 附加高亮器
      registerHighligher(monaco);

      // 创建编辑器实例
      const instance = monaco.editor.create(container.value, {
         ...defaultEditorOptions,
         ...options?.options,
      });
      editorInstance = instance;
      editorInstanceReadyCallbacks.forEach((callback) =>
         callback(editorInstance!, monaco!)
      );

      // 自定义编辑器打开器
      editorActions.customizeEditorOpener(monaco, instance, emitterKey);

      // 注册语言服务
      registerLanguageWorkers(monaco, options?.getWorker);
   });

   onUnmounted(() => {
      // 销毁
      editorInstance &&
         editorBeforeDisposedCallbacks.forEach((callback) =>
            callback(editorInstance!)
         );
      monaco && monaco.editor.getModels().forEach((model) => model.dispose());
      editorInstance?.dispose();
   });

   return {
      containerKey,
      createModels,
      disposeModel,
      addExtraLibs,
      onMonacoReady,
      onModelChange,
      onModelSpecificContentChange,
      onModelContentChange,
      onEditorInstanceReady,
      onBeforeEditorDisposed,
   };
};
