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
const mounted = Promise.withResolvers<void>();
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
   for (const item of fsTree.value[0]?.children ?? []) {
      if (item.type === 'file') {
         selectedFilePath.value = item.path;
         break;
      }
   }
   mountFileSystem(contentMap).then(mounted.resolve);
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

const { mountFileSystem, runCommand, getInstance, exposeServer } =
   useWebContainer({
      workdirName: 'workspace',
   });
const terminal = useTemplateRef('terminal');

const run = async () => {
   const installProcess = await runCommand('yarn --cwd ./project install');
   await mounted.promise;
   await terminal.value!.attachProcess(installProcess);
   await installProcess.exit;

   await terminal.value?.writeTerminal('\n');
   appendNodeModulesFolder();

   const shell = await runCommand('sh');
   const { writer } = await terminal.value!.attachProcess(shell);
   writer.write('cd ./project && yarn dev\n');
};
run();

const appendNodeModulesFolder = () => {
   if (!fsTree.value) return;
   fsTree.value[0]!.children?.unshift({
      name: 'node_modules',
      path: '/project/node_modules',
      type: 'folder',
      suspense: true,
   });
};

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

const previewUrl = ref<string>();
const hostName = ref<string>();
onMounted(() => {
   watch(exposeServer, (server) => {
      if (!server) return;
      previewUrl.value = server.url;
      hostName.value = `localhost:${server.port}`;
   });
});

// getInstance().then((instance) => {
//    instance.fs.watch('/project', { recursive: true }, (event, filename) => {
//       console.log('File system change detected:', event, filename);
//    });
// });
</script>

<template>
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
</template>
