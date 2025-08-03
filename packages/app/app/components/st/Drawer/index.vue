<script setup lang="ts">
import { Teleport } from 'vue';

const props = defineProps<{
   global?: boolean;
   width?: string;
}>();

const opened = defineModel<boolean>('opened', {
   default: false,
});
</script>

<template>
   <Component
      :is="global ? Teleport : 'div'"
      to="body"
      :class="{ 'pointer-events-none': !opened }"
      class="w-full h-full z-[100]">
      <div
         @click.self="opened = false"
         @wheel.prevent
         @touchmove.prevent
         :class="[
            global
               ? 'w-screen h-screen absolute top-0 left-0'
               : 'w-full h-full',
            { 'pointer-events-none': !opened },
            {
               'fixed top-0 left-0': global,
               'bg-background/50 backdrop-blur-xs': opened,
            },
         ]"
         class="z-[100] flex items-center justify-end transition-all">
         <div
            class="h-screen w-fit bg-black border-l border-accent-600 transition-all duration-300"
            :class="[opened ? 'right-0' : 'translate-x-full', ,]"
            :style="{ width: props.width }">
            <slot></slot>
         </div>
      </div>
   </Component>
</template>
