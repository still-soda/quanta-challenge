import { DEFAULT_EDITOR_CONFIG, type EditorConfig } from '../_configs';
import type * as monaco from 'monaco-editor';

interface IUseEditorConfigOptions {
   onEditorInstanceReady: (
      callback: (instance: monaco.editor.IStandaloneCodeEditor) => void
   ) => void;
}

export const useEditorConfig = (options: IUseEditorConfigOptions) => {
   const { onEditorInstanceReady } = options;

   // 编辑器配置（使用默认值）
   const editorConfig = useLocalStorage<EditorConfig>('editor-config', {
      ...DEFAULT_EDITOR_CONFIG,
   });

   // 监听配置变化，实时更新编辑器
   watch(
      () => editorConfig.value.fontSize,
      (newFontSize) => {
         onEditorInstanceReady((instance) => {
            instance.updateOptions({
               fontSize: newFontSize,
            });
         });
      },
      { immediate: true }
   );

   return { editorConfig };
};
