<script setup lang="ts">
import type { IFileSystemItem } from './type';

const props = defineProps<{
   directory: IFileSystemItem[];
   currentFilePath?: string;
   deep?: number;
   defaultOpened?: boolean;
   fileLoader?: (path: string) => Promise<string>;
   dirLoader?: (
      path: string
   ) => Promise<{ name: string; type: 'file' | 'folder' }[]>;
}>();

const sortedDirectory = computed(() => {
   return props.directory.sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
   });
});

const emits = defineEmits(['file-or-folder-click']);
const handleFileOrFolderClick = async (fileOrFolder: IFileSystemItem) => {
   if (fileOrFolder.suspense) {
      if (fileOrFolder.type === 'folder' && props.dirLoader) {
         const dir = await props.dirLoader(fileOrFolder.path);
         const dirPath = fileOrFolder.path.endsWith('/')
            ? fileOrFolder.path.slice(0, -1)
            : fileOrFolder.path;
         fileOrFolder.children = dir.map((item) => ({
            name: item.name,
            type: item.type,
            path: `${dirPath}/${item.name}`,
            suspense: true,
         }));
         fileOrFolder.suspense = false;
      } else if (fileOrFolder.type === 'file' && props.fileLoader) {
         fileOrFolder.content = await props.fileLoader(fileOrFolder.path);
         fileOrFolder.suspense = false;
      }
   }
   emits('file-or-folder-click', fileOrFolder);
};
</script>

<template>
   <div class="w-full">
      <div v-for="item in sortedDirectory" :key="item.path" class="w-full">
         <StFileSystemTreeFileItem
            v-if="item.type === 'file'"
            @click="handleFileOrFolderClick(item)"
            :file="item"
            :selected="props.currentFilePath === item.path"
            :deep="deep ?? 0" />
         <StFileSystemTreeFolderItem
            v-else
            :default-opened="props.defaultOpened"
            :folder="item"
            :current-file-path="props.currentFilePath"
            :deep="deep ?? 0"
            @file-or-folder-click="handleFileOrFolderClick" />
      </div>
   </div>
</template>
