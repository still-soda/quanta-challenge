<script setup lang="ts">
import type { FileSystemItem } from './type';

const props = defineProps<{
   directory: FileSystemItem[];
   currentFilePath?: string;
   deep?: number;
}>();

const sortedDirectory = computed(() => {
   return props.directory.sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
   });
});

const emits = defineEmits(['file-or-folder-click']);
const handleFileOrFolderClick = (fileOrFolder: FileSystemItem) => {
   emits('file-or-folder-click', fileOrFolder);
};
</script>

<template>
   <div class="w-full">
      <div v-for="(item, idx) in sortedDirectory" :key="idx" class="w-full">
         <StFileSystemTreeFileItem
            v-if="item.type === 'file'"
            @click="handleFileOrFolderClick(item)"
            :file="item"
            :selected="props.currentFilePath === item.path"
            :deep="deep ?? 0" />
         <StFileSystemTreeFolderItem
            v-else
            :folder="item"
            :current-file-path="props.currentFilePath"
            :deep="deep ?? 0"
            @file-or-folder-click="handleFileOrFolderClick" />
      </div>
   </div>
</template>
