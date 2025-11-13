<script setup lang="tsx">
import type { Component } from 'vue';
import type { IFileSystemItem } from '~/components/st/FileSystemTree/type';
import FsTreeSkeleton from '../_skeletons/FsTreeSkeleton.vue';
import { FileAdditionOne, FolderPlus } from '@icon-park/vue-next';
import RightClickMenuProvider from '../_components/RightClickMenuProvider.vue';

defineProps<{
   fsTree?: IFileSystemItem[];
   fileLoader?: (path: string) => Promise<string>;
   dirLoader?: (
      path: string
   ) => Promise<{ name: string; type: 'file' | 'folder' }[]>;
}>();

const selectedPath = defineModel<string>('selectedPath');
const onFileOrFolderClick = ({ path }: { path: string }) => {
   selectedPath.value = path;
};

const emits = defineEmits(['addFile', 'addFolder', 'moveItem']);

const Operation: Component = (_, { slots }) => {
   return (
      <div class='cursor-pointer hover:bg-accent-500/50 transition-colors p-1 rounded-sm'>
         {slots.default?.()}
      </div>
   );
};

// 处理拖拽移动
const handleDrop = (
   targetFolder: IFileSystemItem,
   draggedItem: IFileSystemItem
) => {
   if (!targetFolder || !draggedItem) return;

   // 构建新路径
   const targetPath = targetFolder.path.endsWith('/')
      ? targetFolder.path.slice(0, -1)
      : targetFolder.path;
   const newPath = `${targetPath}/${draggedItem.name}`;

   // 触发移动事件
   emits('moveItem', draggedItem.path, newPath);
};
</script>

<template>
   <StSpace
      fill
      direction="vertical"
      gap="1rem"
      class="bg-[#1F1F1F] rounded-xl p-3">
      <StSpace
         fill-x
         justify="between"
         align="center"
         class="text-accent-200"
         gap="0">
         <h2 class="st-font-body-normal overflow-ellipsis line-clamp-1">
            资源管理器
         </h2>
         <StSpace gap="0.25rem">
            <Operation @click="$emit('addFile')">
               <FileAdditionOne />
            </Operation>
            <Operation @click="$emit('addFolder')">
               <FolderPlus />
            </Operation>
         </StSpace>
      </StSpace>
      <StSpace fill class="relative overflow-x-hidden">
         <StSkeleton :loading="!fsTree">
            <template #loading>
               <FsTreeSkeleton />
            </template>
            <RightClickMenuProvider>
               <StFileSystemTree
                  v-if="fsTree"
                  class="absolute top-0 left-0"
                  @contextmenu.prevent
                  @file-or-folder-click="onFileOrFolderClick"
                  @drop="handleDrop"
                  :dir-loader="dirLoader"
                  :file-loader="fileLoader"
                  :current-file-path="selectedPath"
                  :default-opened="true"
                  :directory="fsTree" />
            </RightClickMenuProvider>
         </StSkeleton>
      </StSpace>
   </StSpace>
</template>
