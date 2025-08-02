<script setup lang="ts">
import type { IDirectory } from '~/components/st/DropUploader/walk-file-list';
import type { FileSystemItem } from '~/components/st/FileSystemTree/type';

const props = defineProps<{
   placeholder?: string;
}>();

const directory = ref<IDirectory>();
const fileSystemItems = ref<FileSystemItem[]>([]);
const projectFs = defineModel<Record<string, string>>('projectFs');

const walkDirectory = () => {
   if (!directory.value) {
      fileSystemItems.value = [];
      return;
   }
   const project: Record<string, string> = {};
   const flatDirectory = (dir: IDirectory, root = ''): FileSystemItem[] => {
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
const handleFileOrFolderClick = (target: FileSystemItem) => {
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
   directory.value = {};
   fileSystemItems.value = [];
   previewCode.value = '';
};
</script>

<template>
   <div
      :class="[
         'border border-accent-300 rounded-lg overflow-hidden',
         !directory ? 'h-[10.6rem]' : 'h-[20rem]',
         [
            'bg-background',
            !directory && 'hover:bg-accent-600/50 hover:cursor-pointer',
         ],
         'transition-colors',
         'flex items-center justify-center',
      ]">
      <StDropUploader
         v-if="!directory"
         :placeholder="props.placeholder"
         type="folder"
         @update:directory="directory = $event" />
      <StSpace v-else fill gap="0.75rem" class="p-2">
         <StSpace
            direction="vertical"
            gap="0.5rem"
            class="w-[12.56rem] h-full shrink-0">
            <StScrollable fill scroll-y class="overflow-x-hidden">
               <StSpace direction="vertical">
                  <StFileSystemTree
                     @file-or-folder-click="handleFileOrFolderClick"
                     :current-file-path="currentFilePath"
                     :directory="fileSystemItems"
                     class="w-full h-full" />
                  <div class="h-16 w-full"></div>
               </StSpace>
            </StScrollable>
            <StButton
               class="!rounded-[0.25rem] !bg-transparent border !border-error h-[1.875rem] w-full px-[1.25rem]">
               <StSpace
                  @click="handleRemoveFile"
                  gap="0.375rem"
                  align="center"
                  class="text-error">
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
