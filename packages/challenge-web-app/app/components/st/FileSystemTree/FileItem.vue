<script setup lang="tsx">
import { FileCode } from '@icon-park/vue-next';
import type { IFileSystemItem } from './type';
import { extensionIconMapping } from './config';

const props = defineProps<{
   file: IFileSystemItem;
   deep: number;
   selected?: boolean;
}>();

const emits = defineEmits<{
   dragStart: [item: IFileSystemItem];
   dragEnd: [];
}>();

const FileIcon = () => {
   const name = props.file.name;
   const segments = name.split('.');
   for (let i = -1; i < segments.length; i++) {
      const ext = i === -1 ? name : '.' + segments.slice(i).join('.');
      const iconPath =
         extensionIconMapping.get(ext) || extensionIconMapping.get(name);
      if (iconPath) {
         return <img src={iconPath} alt={name} class='size-4 shrink-0' />;
      }
   }
   return <FileCode theme='filled' size='1rem' />;
};

const handleDragStart = (e: DragEvent) => {
   e.dataTransfer!.effectAllowed = 'move';
   e.dataTransfer!.setData('text/plain', props.file.path);
   emits('dragStart', props.file);
};

const handleDragEnd = () => {
   emits('dragEnd');
};
</script>

<template>
   <div
      draggable="true"
      data-type="file"
      :data-path="props.file.path"
      :style="{ paddingLeft: `${props.deep * 1 + 0.5}rem` }"
      class="flex items-center gap-1 font-mono min-w-fit w-full py-1 px-2 hover:cursor-pointer hover:bg-accent-600 transition-colors"
      :class="{ 'bg-accent-600': props.selected }"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd">
      <FileIcon class="pointer-events-none" />
      <div class="pointer-events-none text-sm text-nowrap whitespace-nowrap">
         {{ file.name }}
      </div>
   </div>
</template>
