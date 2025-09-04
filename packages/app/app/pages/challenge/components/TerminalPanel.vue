<script setup lang="ts">
import { useTerminal } from '~/composables/challenge/use-terminal';
import Tab from './Tab.vue';
import { DeleteFour, Plus } from '@icon-park/vue-next';
import type { WebContainerProcess } from '@webcontainer/api';
import TabSkeleton from './skeleton/TabSkeleton.vue';

const { containerKey, attachProcess, onTerminalReady, container, getInstance } =
   useTerminal();

onTerminalReady((_, fitAddon) => {
   const debounceFit = useDebounceFn(() => {
      fitAddon.fit();
   }, 200);
   const resizeObserver = new ResizeObserver(debounceFit);
   resizeObserver.observe(container.value!);
});

const writeTerminal = async (str: string) => {
   const instance = await getInstance();
   instance.terminal.write(str);
};

const hasProcessReady = ref(false);
defineExpose({
   attachProcess: async (process: WebContainerProcess) => {
      hasProcessReady.value = true;
      return await attachProcess(process);
   },
   writeTerminal,
});
</script>

<template>
   <StSpace fill direction="vertical" gap="0" class="bg-[#181818] rounded-xl">
      <StSpace
         fill-x
         class="p-1 rounded-t-xl bg-accent-600"
         justify="between"
         align="center"
         gap="0">
         <StSpace
            fill-x
            class="h-[2.15rem] relative overflow-x-auto mini-scrollbar">
            <StSpace fill-x gap="0.5rem" class="absolute left-0 top-0 p-1">
               <StSkeleton :loading="!hasProcessReady">
                  <template #loading>
                     <TabSkeleton :count="2" />
                  </template>
                  <Tab
                     content="jsh"
                     :class="{
                        '!bg-secondary !text-background hover:!border-secondary !pl-3': true,
                     }">
                     <template #remove-icon>
                        <DeleteFour />
                     </template>
                  </Tab>
                  <StSpace
                     class="p-[0.25rem] rounded-[0.375rem] bg-accent-500 text-accent-200 hover:border-secondary border border-transparent cursor-pointer">
                     <Plus />
                  </StSpace>
               </StSkeleton>
            </StSpace>
         </StSpace>
      </StSpace>
      <StSpace fill class="relative overflow-hidden">
         <StSpace fill class="relative my-2 mx-3">
            <main
               v-show="hasProcessReady"
               :ref="containerKey"
               class="absolute left-0 top-0 w-full h-[calc(100%-1rem)]"></main>
         </StSpace>
      </StSpace>
   </StSpace>
</template>

<style lang="css">
.xterm-viewport {
   background: transparent !important;
}
</style>
