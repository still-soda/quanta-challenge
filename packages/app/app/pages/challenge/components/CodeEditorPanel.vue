<script setup lang="ts">
import { useMonacoEditor } from '~/composables/challenge/use-monaco-editor';
import Tab from './Tab.vue';

const currentFilePath = defineModel<string>('currentFilePath');

interface ITab {
   path: string;
   name: string;
}

const openedTabs = ref<ITab[]>([]);
watch(
   currentFilePath,
   (newPath) => {
      console.log(newPath);
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
   openedTabs.value.splice(openedTabs.value.indexOf(tab), 1);
};

const onClickTab = (tab: ITab) => {
   setModel(tab.path);
   currentFilePath.value = tab.path;
};

const props = defineProps<{
   defaultFs?: Record<string, { vid: string; content: string }>;
}>();

const { containerKey, createModels, onEditorInstanceReady, onModelChange } =
   useMonacoEditor();
onEditorInstanceReady(() => {
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

const setModel = (path: string) => {
   onEditorInstanceReady((instance, monaco) => {
      const model = monaco.editor.getModel(monaco.Uri.file(path));
      if (model) {
         instance.setModel(model);
         currentFilePath.value = path;
      }
   });
};
defineExpose({ setModel });
</script>

<template>
   <StSpace fill direction="vertical" gap="0" class="bg-[#1F1F1F] rounded-xl">
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
               <Tab
                  v-for="item in openedTabs"
                  :key="item.path"
                  :content="item.name"
                  :class="{
                     '!bg-primary !text-white': currentFilePath === item.path,
                  }"
                  @click="onClickTab(item)"
                  @remove="onCloseTab(item)" />
            </StSpace>
         </StSpace>
         <StSpace
            center
            class="size-[2rem] rounded-[0.5rem] m-0.5 text-accent-200 bg-accent-500">
            <StIcon name="MoreOne" />
         </StSpace>
      </StSpace>
      <StSpace fill class="relative bg-[#1C1C1C] border border-[#1F1F1F]">
         <main
            :ref="containerKey"
            class="absolute top-0 left-0 size-full"></main>
      </StSpace>

      <StSpace fill-x class="px-4 py-3 rounded-b-xl bg-accent-600">
         <div class="text-accent-300 text-xs">已保存</div>
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
