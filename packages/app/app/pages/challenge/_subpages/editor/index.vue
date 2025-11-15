<script setup lang="ts">
import { buildFileSystemTree } from '~/utils/fs-tree';
import type { IFileSystemItem } from '~/components/st/FileSystemTree/type';
import FileManagerPanel from './_modules/FileManagerPanel.vue';
import CodeEditorPanel from './_modules/CodeEditorPanel.vue';
import TerminalPanel from './_modules/TerminalPanel.vue';
import PreviewPanel from './_modules/PreviewPanel.vue';
import { useWebContainer } from '../../_composables/use-web-container';
import DetailWindow from './_components/DetailWindow.vue';
import CommitModal from './_components/CommitModal.vue';
import { useCommands } from '../../_composables/use-commands';

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
const pathToRecreate = new Set<string>();

const handleFileClick = (_: IFileSystemItem, wasSuspense: boolean) => {
   // 如果点击的是 suspense 文件，标记需要强制重新创建 model
   wasSuspense && pathToRecreate.add(_.path);
};

onMounted(() => {
   watch(selectedPath, (newPath) => {
      if (!newPath) return;

      codeEditor.value?.setModel(newPath, pathToRecreate.has(newPath));

      pathToRecreate.delete(newPath);
   });

   const contentChangeCallback = (path: string, content: string) => {
      console.log('change');

      const normalizedPath = path.startsWith('/') ? path : `/${path}`;

      if (
         !pathContentMap.value?.[normalizedPath] ||
         !pathTreeNodeMap.value?.[normalizedPath]
      ) {
         return;
      }

      pathContentMap.value[normalizedPath].content = content;
      pathTreeNodeMap.value[normalizedPath].content = content;
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
const runProject = async () => {
   const terminalInstance = await terminal.value?.createTerminal();
   const terminalId = terminalInstance?.id;

   editorStore.hasProjectInitialized = false;
   const installProcess = await runCommand('yarn --cwd ./project install');
   await mounted.promise;
   await terminal.value!.attachProcess({
      process: installProcess,
      id: terminalId,
      name: 'install',
   });
   await installProcess.exit;
   editorStore.hasProjectInitialized = true;

   await terminal.value?.writeTerminal('\n');

   const shell = await runCommand('sh');
   const { writer } = await terminal.value!.attachProcess({
      process: shell,
      id: terminalId,
      name: 'dev-server',
   });
   writer.write('cd ./project && yarn dev\n');
};
onMounted(runProject);

// handle add terminal
const addTerminal = async () => {
   const process = await runCommand('sh');
   await terminal.value?.createTerminal({ process, name: 'jsh' });
};

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

   // 更新 pathTreeNodeMap,确保新创建的文件也能被监听到内容变化
   if (pathTreeNodeMap.value && fsTree.value) {
      const findNode = (
         items: IFileSystemItem[],
         targetPath: string
      ): IFileSystemItem | null => {
         for (const item of items) {
            if (item.path === targetPath) {
               return item;
            }
            if (item.type === 'folder' && item.children) {
               const found = findNode(item.children, targetPath);
               if (found) return found;
            }
         }
         return null;
      };

      const node = findNode(fsTree.value, filePath);
      if (node && !pathTreeNodeMap.value[filePath]) {
         pathTreeNodeMap.value[filePath] = node;
      }
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
const getProblemDetail = async () => {
   if (!props.id || isNaN(props.id)) {
      throw new Error('Problem ID is required');
   }
   return await $trpc.protected.problem.getProblemDetail.query({
      problemId: props.id,
   });
};
const { data: problem } = await useAsyncData(
   `problem-detail-${props.id}`,
   getProblemDetail
);

const appBaseUrl = useRuntimeConfig().public.appBaseUrl;

// command for right-click menu
const { operator } = useCommands({
   runCommand,
   getWebContainerInstance: getInstance,
   fsTree,
});

// handle move item
const handleMoveItem = async (oldPath: string, newPath: string) => {
   try {
      if (!operator) {
         console.error('Operator not ready');
         return;
      }
      await operator.moveItem(oldPath, newPath);
   } catch (error) {
      console.error('Failed to move item:', error);
   }
};

// seo enhancement
useSeoMeta({
   title: `#${props.id} ${problem.value?.title} - Quanta Challenge`,
   description: problem.value?.detail.slice(0, 100),
   ogTitle: `#${props.id} ${problem.value?.title} - Quanta Challenge`,
   ogDescription: problem.value?.detail.slice(0, 100),
   ogImage: `${appBaseUrl}/api/static/${problem.value?.coverImageName}`,
   ogUrl: `${appBaseUrl}/challenge/${props.id}`,
   ogSiteName: 'Quanta Challenge',
   ogType: 'website',
   ogLocale: 'zh_CN',
});
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
                  :fs-tree="fsTree"
                  v-model:selected-path="selectedPath"
                  @move-item="handleMoveItem"
                  @file-click="handleFileClick" />
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
                           <TerminalPanel
                              ref="terminal"
                              @add-terminal="addTerminal" />
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
