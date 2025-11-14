<script setup lang="ts">
import { FolderClose, FolderOpen } from '@icon-park/vue-next';
import type { IFileSystemItem } from './type';

const props = defineProps<{
   folder: IFileSystemItem;
   deep: number;
   defaultOpened?: boolean;
   currentFilePath?: string;
}>();

const opened = ref(props.defaultOpened ?? false);

const emits = defineEmits<{
   'file-or-folder-click': [item: IFileSystemItem];
   dragStart: [item: IFileSystemItem];
   dragEnd: [];
   drop: [targetFolder: IFileSystemItem, draggedItem: IFileSystemItem];
}>();

const handleFileOrFolderClick = (fileOrFolder: IFileSystemItem) => {
   emits('file-or-folder-click', fileOrFolder);
};
const handleOpenedChange = () => {
   opened.value = !opened.value;
   return true;
};

const selected = computed(() => {
   return props.currentFilePath === props.folder.path;
});

// 拖拽相关
const isDragOver = ref(false);

const handleDragStart = (e: DragEvent) => {
   e.stopPropagation();
   e.dataTransfer!.effectAllowed = 'move';
   e.dataTransfer!.setData('text/plain', props.folder.path);
   emits('dragStart', props.folder);
};

const handleDragEnd = () => {
   emits('dragEnd');
};

const handleDragOver = (e: DragEvent) => {
   e.preventDefault();
   e.stopPropagation();
   e.dataTransfer!.dropEffect = 'move';
   isDragOver.value = true;
};

const handleDragLeave = (e: DragEvent) => {
   e.stopPropagation();
   isDragOver.value = false;
};

const handleDrop = (e: DragEvent) => {
   e.preventDefault();
   e.stopPropagation();
   isDragOver.value = false;
   emits('drop', props.folder, null as any); // 将在父组件中处理
};

const handleChildDragStart = (item: IFileSystemItem) => {
   emits('dragStart', item);
};

const handleChildDragEnd = () => {
   emits('dragEnd');
};

const handleChildDrop = (
   targetFolder: IFileSystemItem,
   draggedItem: IFileSystemItem
) => {
   emits('drop', targetFolder, draggedItem);
};
</script>

<template>
   <div class="flex flex-col w-full">
      <div
         draggable="true"
         data-type="folder"
         :data-path="props.folder.path"
         :style="{ paddingLeft: `${props.deep * 1 + 0.5}rem` }"
         class="flex items-center gap-1 font-family-fira-code py-1 px-2 hover:cursor-pointer hover:bg-accent-600 w-full transition-all border-transparent"
         :class="{
            'bg-accent-600': selected,
            'bg-primary/30 border-l-2 !border-primary': isDragOver,
         }"
         @click.stop="handleOpenedChange() && handleFileOrFolderClick(folder)"
         @dragstart="handleDragStart"
         @dragend="handleDragEnd"
         @dragover="handleDragOver"
         @dragleave="handleDragLeave"
         @drop="handleDrop">
         <FolderOpen
            v-show="opened"
            theme="filled"
            size="1rem"
            class="text-secondary pointer-events-none" />
         <FolderClose
            v-show="!opened"
            theme="filled"
            size="1rem"
            class="text-secondary icon pointer-events-none" />
         <div class="text-sm text-nowrap whitespace-nowrap pointer-events-none">
            {{ folder.name }}
         </div>
      </div>
      <StFileSystemTree
         v-if="opened"
         @file-or-folder-click="handleFileOrFolderClick"
         @drag-start="handleChildDragStart"
         @drag-end="handleChildDragEnd"
         @drop="handleChildDrop"
         :current-file-path="props.currentFilePath"
         :directory="folder.children ?? []"
         :deep="deep + 1" />
   </div>
</template>

<style scoped>
.icon :deep(path):nth-child(2) {
   stroke: var(--st-color-secondary);
}
</style>
