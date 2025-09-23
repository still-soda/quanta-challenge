<script setup lang="tsx">
import { FileCode } from '@icon-park/vue-next';
import type { IFileSystemItem } from './type';
import { extensionIconMapping } from './config';

const props = defineProps<{
   file: IFileSystemItem;
   deep: number;
   selected?: boolean;
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
</script>

<template>
   <div
      data-type="file"
      :data-path="props.file.path"
      :style="{ paddingLeft: `${props.deep * 1 + 0.5}rem` }"
      class="flex items-center gap-1 font-family-fira-code min-w-fit w-full py-1 px-2 hover:cursor-pointer hover:bg-accent-600"
      :class="{ 'bg-accent-600': props.selected }">
      <FileIcon class="pointer-events-none" />
      <div class="pointer-events-none text-sm text-nowrap whitespace-nowrap">
         {{ file.name }}
      </div>
   </div>
</template>
