<script setup lang="ts">
import { buildFileSystemTree } from '../../../utils/fs-tree';
import type { IFileSystemItem } from '~/components/st/FileSystemTree/type';
import FileManagerPanel from './components/FileManagerPanel.vue';
import CodeEditorPanel from './components/CodeEditorPanel.vue';
import TerminalPanel from './components/TerminalPanel.vue';
import PreviewPanel from './components/PreviewPanel.vue';
import { useWebContainer } from '~/composables/challenge/use-web-container';
import DetailWindow from './components/DetailWindow.vue';
import CommitModal from './components/CommitModal.vue';

definePageMeta({ layout: 'challenge-layout' });

const props = defineProps<{ id: number }>();

const { $trpc } = useNuxtApp();

// get and parse project file system
const pathContentMap = ref<Record<string, { vid: string; content: string }>>();
const pathTreeNodeMap = ref<Record<string, IFileSystemItem>>();
const fsTree = ref<IFileSystemItem[]>();
const mounted = Promise.withResolvers<void>();
const getProject = async () => {
   if (!props.id || isNaN(props.id)) {
      throw new Error('Problem ID is required');
   }
   const result = await $trpc.protected.problem.getOrForkProject.query({
      problemId: props.id,
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

   const buildResult = buildFileSystemTree(contentMap);
   fsTree.value = buildResult.rootNodes;
   for (const item of fsTree.value[0]?.children ?? []) {
      if (item.type === 'file') {
         selectedFilePath.value = item.path;
         break;
      }
   }
   pathTreeNodeMap.value = {};
   buildResult.fileNodes.forEach((file) => {
      const path = `/${file.path}`;
      pathTreeNodeMap.value![path] = file;
   });

   mountFileSystem(contentMap).then(mounted.resolve);
   return result;
};
onMounted(getProject);

// file manager
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

// code editor
const codeEditor = useTemplateRef('code-editor');
onMounted(() => {
   watch(selectedPath, (newPath) => {
      newPath && codeEditor.value?.setModel(newPath);
   });

   const contentChangeCallback = (path: string, content: string) => {
      if (!pathContentMap.value?.[path] || !pathTreeNodeMap.value?.[path])
         return;
      pathContentMap.value[path].content = content;
      pathTreeNodeMap.value[path].content = content;
      writeFile(path, content);
   };
   const debounceCallback = useDebounceFn(contentChangeCallback, 300);
   codeEditor.value?.onModelContentChange(debounceCallback);
});

// terminal
const { mountFileSystem, runCommand, getInstance, exposeServer, writeFile } =
   useWebContainer({
      workdirName: 'workspace',
   });
const terminal = useTemplateRef('terminal');

// run project
const editorStore = useEditorStore();
const appendNodeModulesFolder = () => {
   if (!fsTree.value) return;
   fsTree.value[0]!.children?.unshift({
      name: 'node_modules',
      path: '/project/node_modules',
      type: 'folder',
      suspense: true,
   });
};
const runProject = async () => {
   editorStore.hasProjectInitialized = false;
   const installProcess = await runCommand('yarn --cwd ./project install');
   await mounted.promise;
   await terminal.value!.attachProcess(installProcess);
   await installProcess.exit;
   editorStore.hasProjectInitialized = true;

   await terminal.value?.writeTerminal('\n');
   appendNodeModulesFolder();

   const shell = await runCommand('sh');
   const { writer } = await terminal.value!.attachProcess(shell);
   writer.write('cd ./project && yarn dev\n');
};
runProject();

// file system loader
const dirLoader = async (dirPath: string) => {
   const webContainer = await getInstance();
   const dir = await webContainer.fs.readdir(dirPath, { withFileTypes: true });
   return dir.map((item) => ({
      name: item.name,
      type: (item.isDirectory() ? 'folder' : 'file') as 'file' | 'folder',
      path: `${dirPath}/${item.name}`,
   }));
};

const fileLoader = async (filePath: string) => {
   const webContainer = await getInstance();
   const content = await webContainer.fs.readFile(filePath, 'utf-8');
   if (pathContentMap.value) {
      pathContentMap.value[filePath] = { content, vid: '' };
   }
   return content;
};

// preview
const previewUrl = ref<string>();
const hostName = ref<string>();
onMounted(() => {
   watch(exposeServer, (server) => {
      if (!server) return;
      previewUrl.value = server.url;
      hostName.value = `localhost:${server.port}`;
   });
});

// get and parse problem detail
const problem = ref<Awaited<ReturnType<typeof getProblemDetail>>>();
const getProblemDetail = async () => {
   if (!props.id || isNaN(props.id)) {
      throw new Error('Problem ID is required');
   }
   const result = await $trpc.protected.problem.getProblemDetail.query({
      problemId: props.id,
   });
   problem.value = result;
   return result;
};
onMounted(getProblemDetail);
</script>

<template>
   <StSpace fill class="pr-4">
      <DetailWindow :markdown="problem?.detail" />
      <CommitModal
         :run-commands="runCommand"
         :get-wc-instance="getInstance"
         :problem-id="id!" />
      <StSpace fill class="p-4 pt-0">
         <StSplitPanel
            direction="horizontal"
            class="size-full"
            :start-percent="23">
            <template #start>
               <FileManagerPanel
                  :dir-loader="dirLoader"
                  :file-loader="fileLoader"
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
                              :get-wc-instance="getInstance"
                              :default-fs="pathContentMap" />
                        </template>
                        <template #end>
                           <TerminalPanel ref="terminal" />
                        </template>
                     </StSplitPanel>
                  </template>
                  <template #end>
                     <PreviewPanel
                        :preview-url="previewUrl"
                        :host-name="hostName" />
                  </template>
               </StSplitPanel>
            </template>
         </StSplitPanel>
      </StSpace>
   </StSpace>
</template>

<style src="@/assets/css/utils.css" />
