<script setup lang="ts">
import { useMonacoEditor } from '../../../_composables/use-monaco-editor';
import Tab from '../_components/Tab.vue';
import { MoreOne } from '@icon-park/vue-next';
import TabSkeleton from '../_skeletons/TabSkeleton.vue';
import EditorSkeleton from '../_skeletons/EditorSkeleton.vue';
import type { WebContainer } from '@webcontainer/api';

const currentFilePath = defineModel<string>('currentFilePath');

interface ITab {
   path: string;
   name: string;
}

const openedTabs = ref<ITab[]>([]);
watch(
   currentFilePath,
   (newPath) => {
      newPath &&
         !openedTabs.value.find((tab) => tab.path === newPath) &&
         openedTabs.value.push({
            path: newPath,
            name: newPath.split('/').pop() || 'Untitled',
         });
   },
   { immediate: true }
);

const onCloseTab = (tab: ITab) => {
   const idx = openedTabs.value.indexOf(tab);
   if (tab.path === currentFilePath.value) {
      if (idx > 0) {
         currentFilePath.value = openedTabs.value[idx - 1]?.path;
         setModel(currentFilePath.value!);
      } else if (openedTabs.value.length > 1) {
         currentFilePath.value = openedTabs.value[idx + 1]?.path;
         setModel(currentFilePath.value!);
      } else {
         currentFilePath.value = '';
         setModel(null);
      }
   }
   openedTabs.value.splice(openedTabs.value.indexOf(tab), 1);
};

const onClickTab = (tab: ITab) => {
   setModel(tab.path);
   currentFilePath.value = tab.path;
};

const props = defineProps<{
   getWcInstance: () => Promise<WebContainer>;
   defaultFs?: Record<string, { vid: string; content: string }>;
}>();

const {
   containerKey,
   createModels,
   onEditorInstanceReady,
   onModelChange,
   onModelContentChange,
   addExtraLibs,
} = useMonacoEditor();

const hasEditorReady = ref(false);
onEditorInstanceReady(() => {
   hasEditorReady.value = true;
   const disposeWatcher = watch(
      () => props.defaultFs,
      (fs) => {
         if (!fs) return;
         const models = objectMap(fs, ({ value }) => value.content);
         const excludeExt = ['.svg', '.png', '.jpg'];
         Object.keys(models)
            .filter((k) => excludeExt.some((ext) => k.endsWith(ext)))
            .forEach((key) => delete models[key]);

         createModels(models);
         currentFilePath.value && setModel(currentFilePath.value);
         setTimeout(() => {
            disposeWatcher();
         }, 0);
      },
      { immediate: true }
   );
});

onModelChange((path) => {
   currentFilePath.value = path;
});

const setModel = (path: string | null, forceRecreate = false) => {
   onEditorInstanceReady((instance, monaco) => {
      if (!path) {
         instance.setModel(null);
         return;
      }
      const model = monaco.editor.getModel(monaco.Uri.file(path));

      // 如果需要强制重新创建 model（例如处理 suspense 文件）
      if (forceRecreate && model) {
         model.dispose();
      }

      // 重新获取或创建 model
      const existingModel = monaco.editor.getModel(monaco.Uri.file(path));
      if (existingModel && !forceRecreate) {
         instance.setModel(existingModel);
         currentFilePath.value = path;
      } else {
         const content = props.defaultFs?.[path]?.content;
         if (!content) return;
         instance.setModel(
            monaco.editor.createModel(content, void 0, monaco.Uri.file(path))
         );
      }
   });
};

defineExpose({ setModel, onModelContentChange, addExtraLibs });
</script>

<template>
   <StSpace
      fill
      direction="vertical"
      gap="0"
      class="bg-[#1F1F1F] rounded-xl overflow-hidden">
      <StSpace
         fill-x
         class="p-1 rounded-t-xl bg-accent-600"
         justify="between"
         align="center"
         gap="0">
         <StSpace
            fill-x
            class="h-[2rem] relative overflow-x-auto mini-scrollbar">
            <StSpace fill-x gap="0.5rem" class="absolute left-0 top-0 p-1">
               <StSkeleton :loading="!hasEditorReady">
                  <template #loading>
                     <TabSkeleton :count="3" />
                  </template>
                  <Tab
                     v-for="item in openedTabs"
                     :key="item.path"
                     :content="item.name"
                     :class="{
                        '!bg-primary !text-white':
                           currentFilePath === item.path,
                     }"
                     @click="onClickTab(item)"
                     @remove="onCloseTab(item)" />
               </StSkeleton>
            </StSpace>
         </StSpace>
         <StSpace
            center
            class="size-[2rem] rounded-[0.5rem] m-0.5 text-accent-200 bg-accent-500">
            <MoreOne />
         </StSpace>
      </StSpace>
      <StSpace fill class="relative bg-[#1C1C1C] border border-[#1F1F1F]">
         <EditorSkeleton v-if="!hasEditorReady" />
         <main
            v-show="hasEditorReady"
            :ref="containerKey"
            class="absolute top-0 left-0 size-full"></main>
      </StSpace>
   </StSpace>
</template>

<style scoped src="@/assets/css/utils.css" />

<style lang="css">
* {
   --vscode-editorGutter-background: transparent !important;
   --vscode-editor-background: transparent !important;
   /* --vscode-editorStickyScroll-background: #272727 !important; */
}

.suggest-widget {
   border-radius: 0.25rem !important;
   border: 1px solid #272727 !important;
   overflow: hidden !important;
}

.colorpicker-color-decoration {
   border-radius: 4px !important;
}
</style>
