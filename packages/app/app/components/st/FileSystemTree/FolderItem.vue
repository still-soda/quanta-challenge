<script setup lang="ts">
import type { FileSystemItem } from './type';

const props = defineProps<{
   folder: FileSystemItem;
   deep: number;
   defaultOpened?: boolean;
   currentFilePath?: string;
}>();

const opened = ref(props.defaultOpened ?? false);

const emits = defineEmits(['file-or-folder-click']);
const handleFileOrFolderClick = (fileOrFolder: FileSystemItem) => {
   emits('file-or-folder-click', fileOrFolder);
};
const handleOpenedChange = () => {
   opened.value = !opened.value;
   return true;
};
</script>

<template>
   <div class="flex flex-col w-full">
      <div
         :style="{ paddingLeft: `${props.deep * 1 + 0.5}rem` }"
         class="flex items-center gap-1 font-family-fira-code py-0.5 px-2 hover:cursor-pointer hover:bg-accent-600 w-full"
         @click.stop="handleOpenedChange() && handleFileOrFolderClick(folder)">
         <StIcon
            theme="filled"
            :name="opened ? 'FolderOpen' : 'FolderClose'"
            size="1rem"
            class="text-secondary"
            :class="[!opened && 'icon']" />
         <div class="text-sm text-nowrap whitespace-nowrap">
            {{ folder.name }}
         </div>
      </div>
      <StFileSystemTree
         v-if="opened"
         @file-or-folder-click="handleFileOrFolderClick"
         :current-file-path="props.currentFilePath"
         :directory="folder.children!"
         :deep="deep + 1" />
   </div>
</template>

<style scoped>
.icon :deep(path):nth-child(2) {
   stroke: var(--st-color-secondary);
}
</style>
