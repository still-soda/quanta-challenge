<script setup lang="ts">
import { useTerminal } from '~/composables/challenge/use-terminal';
import Tab from './Tab.vue';

const { containerKey, attachProcess, onTerminalReady, container } =
   useTerminal();

onTerminalReady((_, fitAddon) => {
   const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
   });
   resizeObserver.observe(container.value!);
});

defineExpose({ attachProcess });
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
               <Tab
                  content="jsh"
                  :class="{
                     '!bg-secondary !text-background hover:!border-secondary !pl-3': true,
                  }">
                  <template #remove-icon>
                     <StIcon name="DeleteFour" />
                  </template>
               </Tab>
               <StSpace
                  class="p-[0.25rem] rounded-[0.375rem] bg-accent-500 text-accent-200 hover:border-secondary border border-transparent cursor-pointer">
                  <StIcon name="Plus" />
               </StSpace>
            </StSpace>
         </StSpace>
      </StSpace>
      <StSpace fill class="relative">
         <StSpace fill class="relative my-2 mx-3">
            <main
               :ref="containerKey"
               class="absolute left-0 top-0 w-full h-[calc(100%-1rem)]"></main>
         </StSpace>
      </StSpace>
   </StSpace>
</template>

<style lang="css" src="xterm/css/xterm.css" />

<style lang="css">
.xterm-viewport {
   background: transparent !important;
}
</style>
