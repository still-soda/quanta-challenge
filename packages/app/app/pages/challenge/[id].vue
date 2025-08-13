<script setup lang="ts">
import { buildFileSystemTree } from '../../utils/fs-tree';
import type { IFileSystemItem } from '~/components/st/FileSystemTree/type';
import FileManagerPanel from './components/FileManagerPanel.vue';
import CodeEditorPanel from './components/CodeEditorPanel.vue';
import TerminalPanel from './components/TerminalPanel.vue';
import PreviewPanel from './components/PreviewPanel.vue';
import { useWebContainer } from '~/composables/challenge/use-web-container';

definePageMeta({
   layout: 'challenge-layout',
});

const route = useRoute();
const id = route.params.id as string;
if (!id) {
   navigateTo('/app/problems');
}

const { $trpc } = useNuxtApp();
const pathContentMap = ref<Record<string, { vid: string; content: string }>>();
const fsTree = ref<IFileSystemItem[]>();
const getProject = async () => {
   if (!id || isNaN(Number(id))) {
      throw new Error('Problem ID is required');
   }
   const result = await $trpc.protected.problem.getOrForkProject.query({
      problemId: Number(id),
   });
   pathContentMap.value = {};
   result.FileSystem[0]!.files.forEach((file) => {
      pathContentMap.value![`/project/${file.path}`] = {
         content: file.content,
         vid: file.vid,
      };
   });
   const contentMap = objectMap(
      pathContentMap.value,
      ({ value }) => value.content
   );
   fsTree.value = buildFileSystemTree(contentMap);
   mountFileSystem(contentMap);
   return result;
};
onMounted(getProject);

const codeEditor = useTemplateRef('code-editor');
const selectedPath = ref<string>();
const selectedFilePath = ref<string>();

watch(selectedFilePath, (newPath) => {
   newPath && (selectedPath.value = newPath);
});

watch(selectedPath, (newPath) => {
   if (!newPath) return;
   const segments = newPath.split('/').filter(Boolean).slice(1);
   let currentNode = fsTree.value?.[0]!;
   segments.forEach((segment) => {
      currentNode = currentNode.children!.find(
         (child) => child.name === segment
      )!;
   });
   if (currentNode.type === 'file') {
      selectedFilePath.value = newPath;
   }
});

onMounted(() => {
   watch(selectedPath, (newPath) => {
      newPath && codeEditor.value?.setModel(newPath);
   });
});

const { mountFileSystem, runCommand } = useWebContainer();
const terminal = useTemplateRef('terminal');
runCommand('sh').then((process) => {
   terminal.value?.attachProcess(process);
});
</script>

<template>
   <StSpace fill class="p-4 pt-0">
      <StSplitPanel
         direction="horizontal"
         class="size-full"
         :start-percent="18">
         <template #start>
            <FileManagerPanel
               :fsTree="fsTree"
               v-model:selected-path="selectedPath" />
         </template>
         <template #end>
            <StSplitPanel
               direction="horizontal"
               class="size-full"
               :start-percent="55">
               <template #start>
                  <StSplitPanel
                     direction="vertical"
                     class="size-full"
                     :start-percent="65">
                     <template #start>
                        <CodeEditorPanel
                           ref="code-editor"
                           v-model:current-file-path="selectedFilePath"
                           :default-fs="pathContentMap" />
                     </template>
                     <template #end>
                        <TerminalPanel ref="terminal" />
                     </template>
                  </StSplitPanel>
               </template>
               <template #end>
                  <PreviewPanel />
               </template>
            </StSplitPanel>
         </template>
      </StSplitPanel>
   </StSpace>
</template>
