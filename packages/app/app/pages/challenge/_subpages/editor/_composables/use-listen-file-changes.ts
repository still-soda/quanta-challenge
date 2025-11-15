import type * as monaco from 'monaco-editor';
import type { ModelRef } from 'vue';

export interface IFileChangeListenerProps {
   openedTabs: Ref<Array<{ path: string; name: string }>>;
   currentFilePath: ModelRef<string | null>;
   onCloseTab: (tab: { path: string; name: string }) => void;
   defaultFs: Record<string, { vid: string; content: string }>;
   onEditorInstanceReady: (
      callback: (
         instance: monaco.editor.IStandaloneCodeEditor,
         monaco: typeof import('monaco-editor')
      ) => void
   ) => void;
}

/**
 * 监听文件变化事件（移动、删除等），同步更新编辑器和标签页状态
 */
export const useListenFileChanges = (props: IFileChangeListenerProps) => {
   const {
      onEditorInstanceReady,
      openedTabs,
      currentFilePath,
      onCloseTab,
      defaultFs,
   } = props;

   // 监听文件移动事件
   const fileMoveEmitter = useEventBus<{ oldPath: string; newPath: string }>(
      'file-move-event'
   );
   onMounted(() => {
      fileMoveEmitter.on((data) => {
         const { oldPath, newPath } = data;

         // 更新 Monaco Editor 中的 models
         onEditorInstanceReady((instance, monaco) => {
            // 获取所有 models
            const allModels = monaco.editor.getModels();
            const currentModel = instance.getModel();

            // 遍历所有 models，更新受影响的文件
            allModels.forEach((model) => {
               const modelPath = model.uri.path;
               const normalizedModelPath = modelPath.startsWith('/')
                  ? modelPath.slice(1)
                  : modelPath;

               // 检查是否是被移动的文件或文件夹内的文件
               if (
                  normalizedModelPath === oldPath ||
                  normalizedModelPath.startsWith(oldPath + '/')
               ) {
                  const content = model.getValue();
                  const languageId = model.getLanguageId();
                  const updatedNormalizedPath = normalizedModelPath.replace(
                     oldPath,
                     newPath
                  );
                  // Monaco 需要以 / 开头的路径
                  const updatedModelPath = '/' + updatedNormalizedPath;

                  // 创建新 model
                  const newModel = monaco.editor.createModel(
                     content,
                     languageId,
                     monaco.Uri.file(updatedModelPath)
                  );

                  // 如果当前编辑器显示的是这个 model，切换到新 model
                  if (currentModel === model) {
                     instance.setModel(newModel);
                  }

                  // 删除旧 model
                  model.dispose();

                  // 更新 defaultFs（使用不带 / 的路径）
                  if (defaultFs && defaultFs[normalizedModelPath]) {
                     defaultFs[updatedNormalizedPath] =
                        defaultFs[normalizedModelPath];
                     delete defaultFs[normalizedModelPath];
                  }
               }
            });
         });

         // 更新所有受影响的 Tab
         openedTabs.value = openedTabs.value.map((tab) => {
            // 检查是否是被移动的文件或其子文件
            if (tab.path === oldPath || tab.path.startsWith(oldPath + '/')) {
               const updatedPath = tab.path.replace(oldPath, newPath);
               return {
                  path: updatedPath,
                  name: updatedPath.split('/').pop() || 'Untitled',
               };
            }
            return tab;
         });

         // 如果当前打开的文件被移动，更新当前路径
         if (
            currentFilePath.value === oldPath ||
            currentFilePath.value?.startsWith(oldPath + '/')
         ) {
            const updatedPath = currentFilePath.value.replace(oldPath, newPath);
            currentFilePath.value = updatedPath;
         }
      });
   });

   // 监听文件删除事件
   const fileDeleteEmitter = useEventBus<{
      path: string;
      type: 'file' | 'folder';
   }>('file-delete-event');
   onMounted(() => {
      fileDeleteEmitter.on((data) => {
         const { path, type } = data;

         if (type === 'file') {
            // 如果删除的是文件，关闭对应的 Tab
            const tabToRemove = openedTabs.value.find(
               (tab) => tab.path === path
            );
            if (tabToRemove) {
               onCloseTab(tabToRemove);
            }
         } else {
            // 如果删除的是文件夹，关闭该文件夹下所有文件的 Tab
            const tabsToRemove = openedTabs.value.filter((tab) =>
               tab.path.startsWith(path + '/')
            );
            tabsToRemove.forEach((tab) => onCloseTab(tab));
         }
      });
   });

   return { fileMoveEmitter, fileDeleteEmitter };
};
