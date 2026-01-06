<script setup lang="ts">
import {
   FileAdditionOne,
   FolderPlus,
   Delete,
   AddText,
   Copy,
   Clipboard,
   CuttingOne,
} from '@icon-park/vue-next';
import type { DefineComponent } from 'vue';

const getRemoveText = (type: 'file' | 'folder'): string => {
   return type === 'file' ? '删除文件' : '删除文件夹';
};

type CommandConfig = {
   icon: DefineComponent;
   label: string | ((target: HTMLElement | null) => string);
   action?: (
      config: CommandConfig[number][number],
      target: HTMLElement | null
   ) => void;
   isDanger?: boolean;
   disabled?: boolean;
}[][];

export type CommandData = {
   type: string;
   target: {
      type: 'file' | 'folder';
      path: string;
   };
   info: {
      command: CommandConfig[number][number];
      target: HTMLElement | null;
   };
};

const commandEmitter = useEventBus('right-click-menu-command');

// 存储复制/剪切的项目
const copiedItem = ref<{
   type: 'file' | 'folder';
   path: string;
   isCut: boolean;
} | null>(null);

// 监听 copy/cut 事件来更新 copiedItem
const copyEventEmitter = useEventBus<{
   type: 'file' | 'folder';
   path: string;
   isCut: boolean;
}>('file-copy-event');
onMounted(() => {
   copyEventEmitter.on((data) => {
      copiedItem.value = data;
   });
});

function constructCommandData(
   type: string,
   _command: CommandConfig[number][number],
   _target: HTMLElement | null
) {
   return {
      type,
      target: {
         type: _target?.getAttribute('data-type') as any,
         path: _target?.getAttribute('data-path') as string,
      },
      info: {
         command: _command,
         target: _target,
      },
   };
}

const commandConfig = computed<CommandConfig>(() => [
   [
      {
         icon: Copy,
         label: '复制',
         action: (_command, _target) => {
            const data = constructCommandData('copy', _command, _target);
            commandEmitter.emit(data);
         },
      },
      {
         icon: CuttingOne,
         label: '剪切',
         action: (_command, _target) => {
            const data = constructCommandData('cut', _command, _target);
            commandEmitter.emit(data);
         },
      },
      {
         icon: Clipboard,
         label: '粘贴',
         action: (_command, _target) => {
            const data = constructCommandData('paste', _command, _target);
            commandEmitter.emit(data);
         },
         disabled: !copiedItem.value,
      },
      {
         icon: AddText,
         label: '重命名',
         action: (_command, _target) => {
            const data = constructCommandData('rename', _command, _target);
            commandEmitter.emit(data);
         },
      },
      {
         icon: FolderPlus,
         label: '新建文件夹',
         action: (_command, _target) => {
            const data = constructCommandData('add-folder', _command, _target);
            commandEmitter.emit(data);
         },
      },
      {
         icon: FileAdditionOne,
         label: '新建文件',
         action: (_command, _target) => {
            const data = constructCommandData('add-file', _command, _target);
            commandEmitter.emit(data);
         },
      },
   ],
   [
      {
         icon: Delete,
         label: (target) =>
            getRemoveText(target?.getAttribute('data-type') as any),
         isDanger: true,
         action: (_command, _target) => {
            const data = constructCommandData('remove', _command, _target);
            commandEmitter.emit(data);
         },
      },
   ],
]);
</script>

<template>
   <StContextMenuProvider>
      <template #menu>
         <StContextMenuRoot v-slot="{ target }" class="min-w-[10rem]">
            <StContextMenuList class="!text-white">
               <template
                  v-for="(group, groupIndex) in commandConfig"
                  :key="groupIndex">
                  <StContextMenuDevider v-if="groupIndex !== 0" />
                  <StContextMenuItem
                     v-for="(command, commandIndex) in group"
                     :key="commandIndex"
                     :class="command.isDanger ? 'text-error' : ''"
                     :disabled="command.disabled"
                     @action="
                        () => command.action && command.action(command, target)
                     ">
                     <component :is="command.icon" />
                     {{
                        typeof command.label === 'function'
                           ? command.label(target!)
                           : command.label
                     }}
                  </StContextMenuItem>
               </template>
            </StContextMenuList>
         </StContextMenuRoot>
      </template>
      <slot></slot>
   </StContextMenuProvider>
</template>
