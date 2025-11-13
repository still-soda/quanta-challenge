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

const emits = defineEmits<{
   'file-or-folder-click': [item: IFileSystemItem];
   'drag-start': [item: IFileSystemItem];
   'drag-end': [];
   drop: [targetFolder: IFileSystemItem, draggedItem: IFileSystemItem];
}>();

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

// 拖拽状态管理
const draggedItem = ref<IFileSystemItem | null>(null);

const handleDragStart = (item: IFileSystemItem) => {
   draggedItem.value = item;
   emits('drag-start', item);
};

const handleDragEnd = () => {
   draggedItem.value = null;
   emits('drag-end');
};

const handleDrop = (
   targetFolder: IFileSystemItem,
   _draggedItem: IFileSystemItem | null
) => {
   if (!draggedItem.value) return;

   // 防止将文件夹拖到自己或自己的子文件夹中
   if (draggedItem.value.path === targetFolder.path) return;
   if (targetFolder.path.startsWith(draggedItem.value.path + '/')) return;

   emits('drop', targetFolder, draggedItem.value);
   draggedItem.value = null;
};
</script>

<template>
   <div class="w-full">
      <div v-for="item in sortedDirectory" :key="item.path" class="w-full">
         <StFileSystemTreeFileItem
            v-if="item.type === 'file'"
            @click="handleFileOrFolderClick(item)"
            @drag-start="handleDragStart"
            @drag-end="handleDragEnd"
            :file="item"
            :selected="props.currentFilePath === item.path"
            :deep="deep ?? 0" />
         <StFileSystemTreeFolderItem
            v-else
            :default-opened="props.defaultOpened"
            :folder="item"
            :current-file-path="props.currentFilePath"
            :deep="deep ?? 0"
            @file-or-folder-click="handleFileOrFolderClick"
            @drag-start="handleDragStart"
            @drag-end="handleDragEnd"
            @drop="handleDrop" />
      </div>
   </div>
</template>
