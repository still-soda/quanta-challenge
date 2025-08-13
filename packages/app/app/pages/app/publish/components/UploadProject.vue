<script setup lang="ts">
import type { IDirectory } from '~/components/st/DropUploader/walk-file-list';
import type { IFileSystemItem } from '~/components/st/FileSystemTree/type';

const props = defineProps<{
   placeholder?: string;
   ignoreDirectories?: string[];
}>();

const directory = ref<IDirectory>();
const fileSystemItems = ref<IFileSystemItem[]>([]);
const projectFs = defineModel<Record<string, string>>('projectFs');

const walkDirectory = () => {
   if (!directory.value) {
      fileSystemItems.value = [];
      return;
   }
   const project: Record<string, string> = {};
   const flatDirectory = (dir: IDirectory, root = ''): IFileSystemItem[] => {
      const isFolder = (value: any): value is IDirectory => {
         return typeof value !== 'string' && value !== null;
      };
      return Object.entries(dir).map(([key, value]) => {
         if (!isFolder(value)) {
            const path = `${root}/${key}`;
            project[path] = value;
         }
         return {
            name: key.split('/').pop() ?? '',
            path: key,
            type: isFolder(value) ? 'folder' : 'file',
            content: isFolder(value) ? undefined : value,
            children: isFolder(value)
               ? flatDirectory(value, `${root}/${key}`)
               : undefined,
         };
      });
   };
   projectFs.value = project;
   fileSystemItems.value = flatDirectory(directory.value);
};

watch(directory, walkDirectory, { immediate: true });

const previewCode = ref('');
const previewCodeLang = ref('plaintext');
const currentFilePath = ref<string>();
const previewImageBase64 = ref<string>();
const handleFileOrFolderClick = (target: IFileSystemItem) => {
   if (target.type === 'folder') return;
   if (target.content?.startsWith('data:image')) {
      previewImageBase64.value = target.content;
      currentFilePath.value = target.path;
      previewCode.value = '';
      return;
   }
   previewImageBase64.value = undefined;
   previewCode.value = target.content || '';
   previewCodeLang.value = detectLanguage(target.name);
   currentFilePath.value = target.path;
};

const handleRemoveFile = () => {
   fileSystemItems.value = [];
   previewCode.value = '';
   directory.value = undefined;
   projectFs.value = undefined;
};

// 从 projectFs 重建 FileSystemItem[]
const restoreFileSystemItem = () => {
   if (!projectFs.value) return;

   const filePathsMap = new Map<string, IFileSystemItem>();
   const rootItems: IFileSystemItem[] = [];

   // 首先创建所有文件节点
   Object.entries(projectFs.value).forEach(([path, content]) => {
      const segments = path.split('/').filter(Boolean); // 移除空字符串
      const fileName = segments[segments.length - 1] ?? '';

      const fileItem: IFileSystemItem = {
         name: fileName,
         path: segments.join('/'),
         type: 'file',
         content,
      };

      filePathsMap.set(segments.join('/'), fileItem);
   });

   // 然后创建所有必要的文件夹节点
   const allPaths = Array.from(filePathsMap.keys());
   const folderPaths = new Set<string>();

   allPaths.forEach((filePath) => {
      const segments = filePath.split('/');
      // 为每个文件路径创建所有父级文件夹
      for (let i = 1; i < segments.length; i++) {
         const folderPath = segments.slice(0, i).join('/');
         if (!folderPaths.has(folderPath) && !filePathsMap.has(folderPath)) {
            folderPaths.add(folderPath);
            const folderName = segments[i - 1] ?? '';
            const folderItem: IFileSystemItem = {
               name: folderName,
               path: folderPath,
               type: 'folder',
               children: [],
            };
            filePathsMap.set(folderPath, folderItem);
         }
      }
   });

   // 构建树形结构
   const sortedPaths = Array.from(filePathsMap.keys()).sort();

   sortedPaths.forEach((path) => {
      const item = filePathsMap.get(path)!;
      const segments = path.split('/');
      if (segments.length === 1) {
         rootItems.push(item);
      } else {
         const parentPath = segments.slice(0, -1).join('/');
         const parent = filePathsMap.get(parentPath);
         if (parent && parent.type === 'folder') {
            parent.children = parent.children || [];
            parent.children.push(item);
         }
      }
   });

   fileSystemItems.value = rootItems;
};
restoreFileSystemItem();
</script>

<template>
   <div
      :class="[
         'border border-accent-300 rounded-lg overflow-hidden',
         !projectFs ? 'h-[10.6rem]' : 'h-[20rem]',
         [
            'bg-background',
            !projectFs && 'hover:bg-accent-600/50 hover:cursor-pointer',
         ],
         'transition-colors',
         'flex items-center justify-center',
      ]">
      <StDropUploader
         v-if="!projectFs"
         :ignores="{ directories: props.ignoreDirectories }"
         :placeholder="props.placeholder"
         type="folder"
         @update:directory="directory = $event" />
      <StSpace v-else fill gap="0.75rem" class="p-2">
         <StSpace
            direction="vertical"
            gap="0.5rem"
            class="w-[12.56rem] h-full shrink-0 pt-1">
            <StScrollable fill scroll-y class="overflow-x-hidden">
               <StSpace direction="vertical">
                  <StFileSystemTree
                     @file-or-folder-click="handleFileOrFolderClick"
                     :current-file-path="currentFilePath"
                     :directory="fileSystemItems"
                     default-opened
                     class="w-full h-full" />
                  <div class="h-16 w-full"></div>
               </StSpace>
            </StScrollable>
            <StButton
               @click="handleRemoveFile"
               class="!rounded-[0.25rem] !bg-transparent border !border-error h-[1.875rem] w-full px-[1.25rem]">
               <StSpace gap="0.375rem" align="center" class="text-error">
                  <StIcon name="DeleteFour" />
                  <span class="st-font-caption">取消选择</span>
               </StSpace>
            </StButton>
         </StSpace>
         <StScrollable fill scroll class="bg-accent-600 rounded-[0.25rem] p-2">
            <StCodePreview
               v-show="!previewImageBase64"
               :code="previewCode"
               :language="previewCodeLang" />
            <StSpace v-if="previewImageBase64" fill center>
               <img
                  :src="previewImageBase64"
                  class="max-h-[20rem] max-w-[20rem] object-contain" />
            </StSpace>
         </StScrollable>
      </StSpace>
   </div>
</template>
